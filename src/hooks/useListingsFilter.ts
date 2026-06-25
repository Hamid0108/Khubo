// @context: Listing filtering hook — client-side filter and sort
// @purpose: useMemo-based filter pipeline: category → price range → min rating → search query → sort
// @behavior: Returns filtered/sorted copy of listings array (never mutates original)
// @dependencies: Listing type, react (useMemo)

import { useMemo } from 'react';
import { Listing } from '../types';

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  minRating: number;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating';
}

export function useListingsFilter(
  listings: Listing[],
  filters: FilterState,
  searchQuery?: string,
  selectedCategory?: string,
) {
  return useMemo(() => {
    let result = listings ? [...listings] : [];

    if (selectedCategory && selectedCategory !== 'ALL') {
      result = result.filter((l) => l.category === selectedCategory);
    }

    result = result.filter(
      (l) => l.price >= filters.minPrice && l.price <= filters.maxPrice,
    );

    result = result.filter((l) => l.rating >= filters.minRating);

    if (searchQuery?.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.price.toString().includes(q),
      );
    }

    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [listings, filters, searchQuery, selectedCategory]);
}
