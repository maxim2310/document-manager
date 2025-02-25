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
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit-document-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './edit-document-dialog.component.html',
  styleUrl: './edit-document-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDocumentDialogComponent {
  form: FormGroup;
  isProcessing = false;
  isReviewer: boolean;
  statuses = Object.values(DocStatusEnum);

  constructor(
    private dialogRef: MatDialogRef<EditDocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { document: Document; user: User },
    private fb: FormBuilder,
    private documentService: DocumentService
  ) {    
    this.isReviewer = data.user?.role === UserRoleEnum.REVIEWER;

    this.form = this.fb.nonNullable.group({
      name: [data.document.name, Validators.required],
      status: [data.document.status],
    });

    if (this.isReviewer) {
      this.form.get('name')?.disable();
    }
  }

  updateDocument() {
    if (this.form.invalid) return;
    this.isProcessing = true;

    const { name, status } = this.form.value;

    if (this.isReviewer) {
      this.documentService
        .changeStatus(this.data.document.id, { status })
        .subscribe({
          next: () => this.closeDialog('STATUS_UPDATE', { status }),
          error: () => (this.isProcessing = false),
        });
    } else {
      this.documentService
        .updateDocument(this.data.document.id, { name })
        .subscribe({
          next: () => this.closeDialog('UPDATE', { name }),
          error: () => (this.isProcessing = false),
        });
    }
  }

  closeDialog(action: string, data: any) {
    this.isProcessing = false;
    this.dialogRef.close({ action, ...data });
  }

  close() {
    this.dialogRef.close(false);
  }
}
