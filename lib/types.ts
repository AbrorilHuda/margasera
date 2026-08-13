export type ServiceCategory = 
  | 'wedding'
  | 'pre-wedding'
  | 'couple'
  | 'graduation'
  | 'portrait'
  | 'family'
  | 'event';

export type AvailabilityStatus = 'available' | 'almost_full' | 'booked' | 'blocked';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  startingPrice?: number;
}

export interface PackageFeature {
  id: string;
  text: string;
}

export interface Package {
  id: string;
  serviceId: string;
  serviceName?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration: string;
  photographerCount: number;
  editedPhotos: string;
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
}

export interface GalleryProject {
  id: string;
  title: string;
  slug: string;
  category: ServiceCategory;
  categoryLabel: string;
  description: string;
  location: string;
  eventDate: string;
  coverImage: string;
  isFeatured: boolean;
  images?: GalleryImage[];
}

export interface GalleryImage {
  id: string;
  projectId: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
  aspectRatio?: 'portrait' | 'landscape' | 'square';
}

export interface Availability {
  id: string;
  date: string; // YYYY-MM-DD
  status: AvailabilityStatus;
  notes?: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  customerName: string;
  whatsapp: string;
  email: string;
  serviceId: string;
  serviceName?: string;
  packageId: string;
  packageName?: string;
  bookingDate: string;
  startTime?: string;
  endTime?: string;
  location: string;
  eventType?: string;
  notes?: string;
  status: BookingStatus;
  totalPrice?: number;
  createdAt: string;
}
