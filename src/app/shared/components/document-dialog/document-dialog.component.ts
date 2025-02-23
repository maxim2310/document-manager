import { Component, Inject, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DocumentService } from '../../../core/services/document.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';



@Component({
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule
  ],
  selector: 'app-document-dialog',
  templateUrl: './document-dialog.component.html',
  styleUrls: ['./document-dialog.component.scss'],
})
export class DocumentDialogComponent {
  private documentService = inject(DocumentService);
  form: FormGroup;
  isUploading = signal<boolean>(false);
  file: File | null = null;

  constructor(
    private dialogRef: MatDialogRef<DocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      file: [null, Validators.required],
      status: ['DRAFT'],
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.file = file;
      this.form.patchValue({ file });
    }
  }

  createDocument() {
    if (this.form.invalid || !this.file) return;
    this.isUploading.set(true);

    const { name, status } = this.form.value;
    this.documentService
      .createDocument({ name, file: this.file, status })
      .subscribe({
        next: () => {
          this.isUploading.set(false);
          this.dialogRef.close(true); 
        },
        error: () => {
          this.isUploading.set(false);
        },
      });
  }
  

  close() {
    this.dialogRef.close(false);
  }
}
