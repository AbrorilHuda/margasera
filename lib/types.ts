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
export type PaymentStatus = 'unpaid' | 'dp_paid' | 'paid_full';

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface StudioSettings {
  id?: string;
  studioName: string;
  ownerName: string;
  whatsapp: string;
  instagram: string;
  tiktok: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
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

export interface WeddingSlot {
  id: string;
  name: string; // 'Sesi 1 (Pagi / Siang)' | 'Sesi 2 (Sore / Malam)'
  startTime: string; // '08:00'
  endTime: string; // '14:00'
  timeRange: string; // '08:00 - 14:00 WIB'
  isBooked: boolean;
  bookedBy?: string;
}

export interface BookedTimeSlot {
  startTime: string;
  endTime: string;
  serviceCategory: string;
  customerName?: string;
  bookingCode?: string;
}

export interface Availability {
  id: string;
  date: string; // YYYY-MM-DD
  status: AvailabilityStatus;
  notes?: string;
  weddingSlots?: WeddingSlot[];
  bookedTimeSlots?: BookedTimeSlot[];
}

export interface Booking {
  id: string;
  bookingCode: string;
  customerName: string;
  whatsapp: string;
  email: string;
  instagram?: string;
  serviceId: string;
  serviceName?: string;
  packageId: string;
  packageName?: string;
  bookingDate: string;
  startTime?: string;
  endTime?: string;
  slotType?: 'wedding_morning' | 'wedding_afternoon' | 'wedding_fullday' | 'custom';
  location: string;
  eventType?: string;
  notes?: string;
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  downPayment?: number;
  paidAmount?: number;
  remainingAmount?: number;
  totalPrice?: number;
  createdAt: string;
}
