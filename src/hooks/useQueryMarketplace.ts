import { useQuery } from '@tanstack/react-query';
import { MarketplaceService } from '../services';

/**
 * Hook to fetch marketplace items with optional category filter
 */
export function useQueryMarketplaceItems(category?: string) {
  return useQuery({
    queryKey: ['marketplace', category || 'all'],
    queryFn: () => category ? MarketplaceService.getByCategory(category) : MarketplaceService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch single marketplace item by ID
 */
export function useQueryMarketplaceItem(itemId: string) {
  return useQuery({
    queryKey: ['marketplace', 'item', itemId],
    queryFn: () => MarketplaceService.getById(itemId),
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000,
  });
}
