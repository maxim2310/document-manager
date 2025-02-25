import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Signal,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DocStatusEnum } from '../../modules/StatusEnum';
import {
  DocumentPage,
  DocumentService,
  GetDocumentParams,
} from '../../../core/services/document.service';
import { UserService } from '../../../core/services/user.service';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { Sort, MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { MatDialog } from '@angular/material/dialog';
import { DocumentDialogComponent } from '../../components/document-dialog/document-dialog.component';
import { UserRoleEnum } from '../../modules/RolesEnum';
import { EditDocumentDialogComponent } from '../../components/edit-document-dialog/edit-document-dialog.component';
import { distinctUntilChanged } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DeleteDialogComponent } from '../../components/delete-dialog/delete-dialog.component';
import { RevokeDialogComponent } from '../../components/revoke-dialog/revoke-dialog.component';
import { Document } from '../../modules/Document';
import { DatePipe } from '@angular/common';
import { User } from '../../modules/User';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { DocumentReviewDialogComponent } from '../../components/document-review-dialog/document-review-dialog.component';
import { SendToReviewDialogComponent } from '../../components/send-to-review-dialog/send-to-review-dialog.component';

const REVIEWER_COLUMNS = [
  'name',
  'status',
  'creator',
  'updatedAt',
  'actions',
] as const;
const USER_COLUMNS = ['name', 'status', 'updatedAt', 'actions'] as const;

@Component({
  selector: 'app-document-manager',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    FormsModule,
    HeaderComponent,
    MatProgressSpinnerModule,
    DatePipe,
    MatAutocompleteModule,
    ReactiveFormsModule,
  ],
  templateUrl: './document-manager.component.html',
  styleUrls: ['./document-manager.component.scss'],
})
export class DocumentManagerComponent implements OnInit {
  private documentService = inject(DocumentService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private cdRef = inject(ChangeDetectorRef);

  userRole = UserRoleEnum;
  docStatus = DocStatusEnum;

  user = computed(() => this.userService.userSignal());
  users = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  creatorControl = new FormControl<User | string | null>('');
  filteredUsers = signal<User[]>(this.users());
  isReviewer = computed(() => this.user()?.role === this.userRole.REVIEWER);
  displayedColumns = computed(() =>
    this.user()?.role === this.userRole.REVIEWER
      ? REVIEWER_COLUMNS
      : USER_COLUMNS
  );
  dataSource = new MatTableDataSource<Document>([]);
  isLoading = signal<boolean>(true);
  allStatuses = Object.values(DocStatusEnum);
  filterStatus = signal<string | null>(null);
  totalDocuments = signal(0);
  sortData = signal<Sort | null>(null);
  pageIndex = signal(0);
  pageSize = signal(10);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;

  ngOnInit(): void {
    if (this.isReviewer()) {
      this.userService.getUsers().subscribe(users => {
        this.users.set(users);
        this.filteredUsers.set(users);
      });

      this.creatorControl.valueChanges.subscribe(value => {
        const search = typeof value === 'string' ? value.toLowerCase() : '';
        this.filteredUsers.set(
          this.users().filter(user =>
            user.fullName.toLowerCase().includes(search)
          )
        );
      });
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.loadDocuments();

    this.sort.sortChange.pipe(distinctUntilChanged()).subscribe(sortEvent => {
      this.sortData.set(sortEvent);
      if (sortEvent.active !== 'creator') {
        this.loadDocuments();
      } else {
        this.dataSource.data.sort(this.sortByCreator(sortEvent));
      }
    });
  }

  loadDocuments(): void {
    const body = this.createBodyForLoadDocument();
    this.isLoading.set(true);
    this.documentService.getDocuments(body).subscribe((data: DocumentPage) => {
      this.dataSource.data = data.results;
      this.totalDocuments.set(data.count);

      setTimeout(() => {
        this.paginator.length = this.totalDocuments();
        this.paginator.pageIndex = this.pageIndex();
        this.paginator.pageSize = this.pageSize();
        this.isLoading.set(false);
      }, 20);
    });
  }

  createBodyForLoadDocument(): GetDocumentParams {
    const body: GetDocumentParams = {
      page: this.pageIndex() + 1,
      size: this.pageSize(),
    };
    const status = this.filterStatus();
    const creatorId = this.selectedUser()?.id;
    if (!!status) {
      body.status = status;
    }
    if (!!this.sortData() && this.sortData()?.direction) {
      body.sort = `${this.sortData()?.active},${this.sortData()?.direction}`;
    }
    if (creatorId) {
      body.creatorId = creatorId;
    }

    return body;
  }

  handlePageEvent(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);

    this.loadDocuments();
  }

  onCreatorSelected(event: MatAutocompleteSelectedEvent) {
    const selectedUser = this.users().find(
      user => user.id === event.option.value
    );
    this.selectedUser.set(selectedUser || null);
    this.creatorControl.setValue(selectedUser?.fullName || '', {
      emitEvent: false,
    });
    this.loadDocuments();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(DocumentDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadDocuments();
    });
  }
  openEditDialog(document: Document) {
    const dialogRef = this.dialog.open(EditDocumentDialogComponent, {
      width: '400px',
      data: {
        document,
        user: this.user(),
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDocuments();
      }
    });
  }
  openDeleteDialog(document: Document) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '400px',
      data: {
        document,
        user: this.user(),
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDocuments();
      }
    });
  }
  openRevokeDialog(document: Document) {
    const dialogRef = this.dialog.open(RevokeDialogComponent, {
      width: '400px',
      data: {
        document,
        user: this.user(),
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDocuments();
      }
    });
  }
  openReviewDialog(document: Document): void {
    this.documentService.getDocumentById(document.id).subscribe(document => {
      console.log('Fetched Document:', document);
      this.dialog.open(DocumentReviewDialogComponent, {
        width: '100vw',
        height: '100vh',
        panelClass: 'full-screen-dialog',
        data: { documentUrl: document.fileUrl },
      });
    });
  }

  openSendToReviewDialog(document: Document): void {
    const dialogRef = this.dialog.open(SendToReviewDialogComponent, {
      width: '400px',
      data: { document },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDocuments();
      }
    });
  }

  sortByCreator(sortEvent: Sort) {
    return (a: Document, b: Document) => {
      const emailA = a.creator.email.toLowerCase();
      const emailB = b.creator.email.toLowerCase();
      return sortEvent?.direction === 'asc'
        ? emailA.localeCompare(emailB)
        : emailB.localeCompare(emailA);
    };
  }
}
