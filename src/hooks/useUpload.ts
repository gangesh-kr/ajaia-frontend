import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFile } from '../api/upload';

export function useUpload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => uploadFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
