import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../../core/services/document.service';
import { User } from '../../modules/User';
import { Document } from '../../modules/Document';
import { UserRoleEnum } from '../../modules/RolesEnum';
import { DocStatusEnum } from '../../modules/StatusEnum';

@Component({
  selector: 'app-delete-document-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './delete-dialog.component.html',
  styleUrl: './delete-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { document: Document; user: User },
    private documentService: DocumentService
  ) {}

  deleteDocument() {
    this.documentService.deleteDocument(this.data.document.id).subscribe(() => {
      this.dialogRef.close('DELETE');
    });
  }

  canDelete() {
    return (
      this.data.user?.role === UserRoleEnum.USER &&
      (this.data.document.status === DocStatusEnum.DRAFT ||
        this.data.document.status === DocStatusEnum.REVOKE)
    );
  }

  close() {
    this.dialogRef.close();
  }
}
