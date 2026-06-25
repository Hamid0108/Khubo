export interface Review {
  id: string;
  userName: string;
  userImage: string;
  date: string;
  comment: string;
  rating: number;
}

export interface HostInfo {
  name: string;
  image: string;
  reviews: number;
  rating: number;
  hostingDuration: string;
  work: string;
  location: string;
  tenantCount?: number;
}

export interface TenantInfo {
  id: string;
  name: string;
  image: string;
  email: string;
  phone?: string;
  moveInDate: string;
  status: 'active' | 'leaving' | 'moved_out';
  paymentStatus: 'paid' | 'pending' | 'overdue';
}

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
  advancePaymentMonths?: number;
  lat?: number;
  lng?: number;
  city?: string;
  barangay?: string;
  landlord_id?: string;
  reviews: Review[];
  host?: HostInfo;
  tenants?: TenantInfo[];
  isActive?: boolean;
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
