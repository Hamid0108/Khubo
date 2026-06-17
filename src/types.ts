export interface Listing {
  id: string;
  title: string;
  location: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  gallery: string[];
  category: string;
  date: string;
  amenities: string[];
  lat?: number;
  lng?: number;
  city?: string;
  barangay?: string;
  landlord_id?: string;
  reviews: {
    id: string;
    userName: string;
    userImage: string;
    date: string;
    comment: string;
    rating: number;
  }[];
  host?: {
    name: string;
    image: string;
    reviews: number;
    rating: number;
    hostingDuration: string;
    work: string;
    location: string;
    tenantCount?: number;
  };
}

export interface Category {
  label: string;
  icon: string;
  emoji: string;
}

export interface Roommate {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  university: string;
  location: string;
  bio: string;
  image: string;
  tags: string[];
  budgetRange: string;
  preferredPlace: string;
  userId?: string;
  postMode?: 'applying' | 'finding';
}
