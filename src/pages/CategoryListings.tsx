import { useParams, useNavigate } from 'react-router-dom';
import { useListings } from '../hooks/useListings';
import ListingCard from '../components/ListingCard';
import ListingCardSkeleton from '../components/ListingCardSkeleton';
import Footer from '../components/Footer';
import { ChevronLeft, ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';

export default function CategoryListings() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { listings: LISTINGS, loading } = useListings();

  const filteredListings = useMemo(() => {
    if (!categoryId || !LISTINGS) return [];

    if (categoryId === 'recommended') {
      return LISTINGS.slice(0, 21);
    }
    if (categoryId === 'top-listing') {
      return LISTINGS.slice(7, 28);
    }
    if (categoryId === 'near-msu-iit') {
      return LISTINGS.filter(l => l.category === 'Near MSU-IIT');
    }

    // Default: filter by exact category label if it matches
    return LISTINGS.filter(l => l.category.toLowerCase().replace(/\s+/g, '-') === categoryId);
  }, [categoryId, LISTINGS]);

  const title = useMemo(() => {
    if (categoryId === 'recommended') return 'Recommended';
    if (categoryId === 'top-listing') return 'Top Listings';
    if (categoryId === 'near-msu-iit') return 'Near MSU-IIT';
    
    // Convert kebab-case back to Title Case if possible, or just the category name
    const listing = LISTINGS?.find(l => l.category.toLowerCase().replace(/\s+/g, '-') === categoryId);
    return listing ? listing.category : 'Listings';
  }, [categoryId, LISTINGS]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-100 px-4 py-4 md:px-12 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 md:ml-0 hover:bg-neutral-100 rounded-full transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl md:text-2xl font-display font-bold">{title}</h1>
      </header>

      <main className="max-w-[2520px] mx-auto xl:px-12 md:px-12 sm:px-4 px-4 pt-8 pb-32">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <ListingCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {filteredListings.map((listing) => (
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                onClick={() => { navigate(`/listing/${listing.id}`); }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <h2 className="text-xl font-semibold">No listings found</h2>
            <p className="text-neutral-500 mt-2">Check back later for new arrivals.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
