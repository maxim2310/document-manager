import {
  Component,
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
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
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
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { MatDialog } from '@angular/material/dialog';
import { DocumentDialogComponent } from '../../components/document-dialog/document-dialog.component';
import { UserRoleEnum } from '../../modules/RolesEnum';
import { EditDocumentDialogComponent } from '../../components/edit-document-dialog/edit-document-dialog.component';

interface Document {
  id: string;
  name: string;
  status: string;
}

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
  ],
  templateUrl: './document-manager.component.html',
  styleUrls: ['./document-manager.component.scss'],
})
export class DocumentManagerComponent {
  private documentService = inject(DocumentService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);

  user = computed(() => this.userService.userSignal());
  userRole = UserRoleEnum;
  displayedColumns = computed(() =>
    this.user()?.role === this.userRole.REVIEWER
      ? ['name', 'status', 'creator', 'actions']
      : ['name', 'status', 'actions']
  );
  dataSource = new MatTableDataSource<Document>([]);
  isLoading = signal<boolean>(true);
  allStatuses = Object.values(DocStatusEnum);
  filterStatus = signal<string | null>(null);
  totalDocuments = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loadDocuments();
  }

  loadDocuments(): void {
    console.log(this.paginator);

    const body: GetDocumentParams = {
      page: this.paginator.pageIndex + 1,
      size: this.paginator.pageSize,
    };
    const status = this.filterStatus();
    if (!!status) {
      body.status = status;
    }
    this.isLoading.set(true);
    this.documentService.getDocuments(body).subscribe((data: DocumentPage) => {
      this.dataSource.data = data.results;
      this.totalDocuments = data.count;
      this.isLoading.set(false);
    });

    console.log(this.totalDocuments);
    
  }

  handlePageEvent(e: PageEvent) {
    this.loadDocuments();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(DocumentDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadDocuments(); // Refresh table after document creation
    });
  }

  openEditDialog(document: Document) {
    const dialogRef = this.dialog.open(EditDocumentDialogComponent, {
      width: '400px',
      data: {
        document,
        user: this.user()
      },
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadDocuments()
      }
    });
  }
}
