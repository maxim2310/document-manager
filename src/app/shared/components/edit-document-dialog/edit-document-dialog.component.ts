import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DocumentService } from '../../../core/services/document.service';
import { User } from '../../modules/User';
import { Document } from '../../modules/Document';
import { DocStatusEnum } from '../../modules/StatusEnum';
import { UserRoleEnum } from '../../modules/RolesEnum';

@Component({
  selector: 'app-edit-document-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './edit-document-dialog.component.html',
  styles: [
    `
      .full-width {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditDocumentDialogComponent {
  form: FormGroup;
  isProcessing = false;

  constructor(
    private dialogRef: MatDialogRef<EditDocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { document: Document; user: User },
    private fb: FormBuilder,
    private documentService: DocumentService
  ) {
    this.form = this.fb.nonNullable.group({
      name: [data.document.name, Validators.required],
    });
  }

  updateDocument() {
    if (this.form.invalid) return;

    this.isProcessing = true;
    this.documentService
      .updateDocument(this.data.document.id, { name: this.form.value.name })
      .subscribe({
        next: () => {
          this.isProcessing = false;
          this.dialogRef.close({
            action: 'UPDATE',
            name: this.form.value.name,
          });
        },
        error: () => {
          this.isProcessing = false;
        },
      });
  }

  deleteDocument() {
    if (this.canDelete()) {
      this.documentService
        .deleteDocument(this.data.document.id)
        .subscribe(() => {
          this.dialogRef.close({ action: 'DELETE' });
        });
    }
  }

  withdrawDocument() {
    if (this.canRevoke()) {
      this.documentService.revokeReview(this.data.document.id).subscribe(() => {
        this.dialogRef.close({ action: 'WITHDRAW' });
      });
    }
  }

  canDelete() {
    return (
      this.data.user.role === UserRoleEnum.USER &&
      (this.data.document.status === DocStatusEnum.DRAFT ||
        this.data.document.status === DocStatusEnum.REVOKE)
    );
  }

  canRevoke() {
    console.log(this.data.document.status);
    
    return (
      this.data.user.role === UserRoleEnum.USER &&
      this.data.document.status === DocStatusEnum.READY_FOR_REVIEW
    );
  }

  close() {
    this.dialogRef.close(false);
  }
}
