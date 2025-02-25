import {
  Component,
  Inject,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import PSPDFKit from 'pspdfkit';

const baseUrl = `${window.location.protocol}//${window.location.host}/assets/`;

@Component({
  imports: [MatButtonModule],
  selector: 'app-document-review-dialog',
  templateUrl: './document-review-dialog.component.html',
  styleUrls: ['./document-review-dialog.component.scss'],
})
export class DocumentReviewDialogComponent implements AfterViewInit {
  @ViewChild('pspdfContainer', { static: false }) containerRef!: ElementRef;
  instance!: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { documentUrl: string },
    private dialogRef: MatDialogRef<DocumentReviewDialogComponent>
  ) {}

  async ngAfterViewInit(): Promise<void> {
    try {
      this.instance = await PSPDFKit.load({
          container: this.containerRef.nativeElement,
        document: this.data.documentUrl,
        baseUrl: baseUrl,
        });
    } catch (error) {
      console.error('Error loading PSPDFKit:', error);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
