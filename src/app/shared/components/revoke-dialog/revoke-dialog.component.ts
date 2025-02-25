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
  selector: 'app-revoke-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './revoke-dialog.component.html',
  styleUrl: './revoke-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevokeDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<RevokeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { document: Document; user: User },
    private documentService: DocumentService
  ) {}


  withdrawDocument() {
    if (this.canRevoke()) {
      this.documentService.revokeReview(this.data.document.id).subscribe(() => {
        this.dialogRef.close({ action: 'WITHDRAW' });
      });
    }
  }

  canRevoke() {
    console.log(this.data.document);

    return (
      this.data.user?.role === UserRoleEnum.USER &&
      this.data.document.status === DocStatusEnum.READY_FOR_REVIEW
    );
  }

  close() {
    this.dialogRef.close();
  }
}
