import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDocument } from '../api/documents';

interface UpdateParams {
  id: string;
  updates: {
    title?: string;
    content_json?: string | null;
  };
  signal?: AbortSignal;
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates, signal }: UpdateParams) => updateDocument(id, updates, signal),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
