import { useQuery } from '@tanstack/react-query';
import { getSharedDocuments } from '../api/documents';

export function useSharedDocuments() {
  return useQuery({
    queryKey: ['documents', 'shared'],
    queryFn: getSharedDocuments,
  });
}
