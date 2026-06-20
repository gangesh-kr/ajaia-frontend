import { useQuery } from '@tanstack/react-query';
import { getShares } from '../api/shares';

export function useShares(documentId: string) {
  return useQuery({
    queryKey: ['shares', documentId],
    queryFn: () => getShares(documentId),
    enabled: !!documentId,
  });
}
