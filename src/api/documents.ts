import { axiosInstance } from '../lib/axios';
import { Document } from '../types';

export async function createDocument(): Promise<Document> {
  const { data } = await axiosInstance.post<Document>('/documents');
  return data;
}

export async function getDocuments(): Promise<Document[]> {
  const { data } = await axiosInstance.get<Document[]>('/documents');
  return data;
}

export async function getSharedDocuments(): Promise<Document[]> {
  const { data } = await axiosInstance.get<Document[]>('/documents/shared');
  return data;
}

export async function getDocument(id: string): Promise<Document & { role: 'owner' | 'viewer' | 'editor' }> {
  const { data } = await axiosInstance.get<Document & { role: 'owner' | 'viewer' | 'editor' }>(`/documents/${id}`);
  return data;
}

export async function updateDocument(
  id: string,
  updates: { title?: string; content_json?: string | null },
  signal?: AbortSignal
): Promise<Document> {
  const { data } = await axiosInstance.patch<Document>(`/documents/${id}`, updates, { signal });
  return data;
}

export async function exportDocument(id: string): Promise<Blob> {
  const { data } = await axiosInstance.get<Blob>(`/documents/${id}/export`, {
    responseType: 'blob'
  });
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  await axiosInstance.delete(`/documents/${id}`);
}
