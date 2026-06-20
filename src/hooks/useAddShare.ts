import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addShare } from '../api/shares';

interface ShareParams {
  documentId: string;
  userId: string;
  role: 'viewer' | 'editor';
}

export function useAddShare() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ documentId, userId, role }: ShareParams) => addShare(documentId, userId, role),
    onSuccess: (data, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['shares', documentId] });
      queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
    },
  });
}
