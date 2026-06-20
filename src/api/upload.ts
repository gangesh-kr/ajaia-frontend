import { axiosInstance } from '../lib/axios';
import { Document } from '../types';

export async function uploadFile(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await axiosInstance.post<Document>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
}
