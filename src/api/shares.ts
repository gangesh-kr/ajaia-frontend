import { axiosInstance } from '../lib/axios';
import { Share, User } from '../types';

export async function addShare(documentId: string, userId: string, role: 'viewer' | 'editor'): Promise<Share> {
  const { data } = await axiosInstance.post<Share>('/shares', {
    document_id: documentId,
    user_id: userId,
    role
  });
  return data;
}

export async function getShares(documentId: string): Promise<Share[]> {
  const { data } = await axiosInstance.get<Share[]>(`/shares/${documentId}`);
  return data;
}

export async function getUsers(): Promise<User[]> {
  const { data } = await axiosInstance.get<User[]>('/users');
  return data;
}
