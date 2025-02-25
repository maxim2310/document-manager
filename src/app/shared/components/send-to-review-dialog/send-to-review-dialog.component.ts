import { Component, Inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DocumentService } from '../../../core/services/document.service';
import { DocumentReviewDialogComponent } from '../document-review-dialog/document-review-dialog.component';
import { Document } from '../../modules/Document';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-send-to-review-dialog',
  imports: [MatDialogModule, MatCardModule, MatButtonModule],
  templateUrl: './send-to-review-dialog.component.html',
  styleUrl: './send-to-review-dialog.component.scss'
})
export class SendToReviewDialogComponent {
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private dialogRef: MatDialogRef<DocumentReviewDialogComponent>,
    private documentService: DocumentService,
    @Inject(MAT_DIALOG_DATA) public data: { document: Document }
  ) {}

  sendToReview(): void {
    if (!this.data.document) return;
    
    this.isSubmitting.set(true);
    this.documentService.sendToReview(this.data.document.id).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.errorMessage.set('Failed to send document for review.');
        console.error('Review Error:', err);
      },
      complete: () => this.isSubmitting.set(false),
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}