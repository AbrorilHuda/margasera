export interface Testimonial {
  id: string;
  bookingCode?: string | null;
  name: string;
  eventType: string;
  location: string;
  message: string;
  rating: number;
  date: string;
  source: 'Google Review' | 'Client Review';
}

export const CLIENT_TESTIMONIALS: Testimonial[] = [];
