import { useQuery } from '@tanstack/react-query';
import { getDocument } from '../api/documents';

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => getDocument(id),
    enabled: !!id,
  });
}
