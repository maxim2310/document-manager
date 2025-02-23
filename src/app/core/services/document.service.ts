import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Document } from '../../shared/modules/Document';
import { environment } from '../../../environments/environment';

export interface DocumentPage {
  results: Document[];
  count: number;
}

export interface CreateDocumentDto {
  status: 'DRAFT' | 'READY_FOR_REVIEW';
  file: File;
  name: string;
}

export interface UpdateDocumentDto {
  name: string;
}

export interface ChangeDocumentStatusDto {
  status: 'UNDER_REVIEW' | 'APPROVED' | 'DECLINED';
}

export interface GetDocumentParams {
  page: number;
  size: number;
  sort?: string;
  status?: string;
  creatorId?: string;
  creatorEmail?: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}document`;
  public documents = signal<Document[]>([]);

  createDocument(data: CreateDocumentDto): Observable<Document> {
    const formData = new FormData();
    formData.append('status', data.status);
    formData.append('file', data.file);
    formData.append('name', data.name);
    return this.http.post<Document>(this.apiUrl, formData);
  }

  getDocuments(params: GetDocumentParams): Observable<DocumentPage> {
    return this.http
      .get<DocumentPage>(this.apiUrl, { params: { ...params } })
      .pipe(
        tap(res => {
          this.documents.set(res.results);
        })
      );
  }

  getDocumentById(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`);
  }

  updateDocument(id: string, data: UpdateDocumentDto): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}`, data);
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  sendToReview(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/send-to-review`, {});
  }

  revokeReview(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/revoke-review`, {});
  }

  changeStatus(id: string, data: ChangeDocumentStatusDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/change-status`, data);
  }
}
