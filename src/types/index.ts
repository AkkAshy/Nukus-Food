// User types
export interface User {
  id: number;
  phone: string;
  full_name: string;
  email: string | null;
  role: 'user' | 'owner' | 'admin';
  is_verified: boolean;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Restaurant types
export interface Feature {
  id: number;
  name: string;
  icon: string;
}

export interface WorkingHours {
  day_of_week: number;
  day_name: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface RestaurantImage {
  id: number;
  url: string;
  is_main: boolean;
  order: number;
}

export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type: string;
  type_display: string;
  address: string;
  latitude: string;
  longitude: string;
  phone?: string;
  instagram?: string;
  telegram?: string;
  min_order_amount?: number;
  average_check?: number;
  features?: Feature[];
  working_hours?: WorkingHours[];
  images?: RestaurantImage[];
  reservation_mode?: string;
  reservation_mode_display?: string;
  is_open: boolean;
  is_active?: boolean;
  is_verified?: boolean;
  rating: number | null;
  review_count?: number;
  main_image?: string;
  slot_duration?: number;
  min_booking_hours?: number;
}

export interface Place {
  id: number;
  name: string;
  type: string;
  type_display: string;
  capacity: number;
  min_capacity?: number;
  deposit_amount?: number;
  floor?: number;
  description?: string;
  is_active: boolean;
}

// Reservation types
export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface PlaceAvailability {
  id: number;
  name: string;
  type: string;
  capacity: number;
  slots: TimeSlot[];
}

export interface AvailabilityResponse {
  date: string;
  is_closed: boolean;
  places: PlaceAvailability[];
}

export interface Reservation {
  id: number;
  restaurant: number | Restaurant;
  restaurant_name?: string;
  place: number | Place | null;
  place_name?: string;
  date: string;
  time: string;
  time_from: string;
  time_to?: string;
  guest_count: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed' | 'no_show';
  status_display: string;
  created_at: string;
  // Admin/Owner fields
  user_name?: string;
  user_phone?: string;
  phone?: string;
}

export interface ReservationCreate {
  restaurant: number;
  place?: number;
  date: string;
  time_from: string;
  guest_count: number;
  notes?: string;
}

// Menu types
export interface MenuItem {
  id: number;
  category: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  weight?: string;
  is_available: boolean;
  is_popular: boolean;
  order: number;
}

export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  order: number;
  is_active?: boolean;
  items?: MenuItem[];
  items_count?: number;
}

// Owner types
export interface OwnerStats {
  today: {
    total: number;
    confirmed: number;
    pending: number;
  };
  month: {
    total: number;
    completed: number;
    canceled: number;
    no_show: number;
  };
}

export interface OwnerReservation extends Reservation {
  user_name: string;
  user_phone: string;
}

// API Response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ===== Hotels =====

export interface Amenity {
  id: number;
  name: string;
  icon: string;
  scope: 'hotel' | 'room' | 'both';
}

export interface HotelImage {
  id: number;
  url: string;
  is_main: boolean;
  order: number;
}

export interface RoomImage {
  id: number;
  url: string;
  is_main: boolean;
  order: number;
}

export type RoomType =
  | 'single'
  | 'double'
  | 'twin'
  | 'triple'
  | 'family'
  | 'suite'
  | 'apartment';

export interface Room {
  id: number;
  name: string;
  type: RoomType;
  type_display: string;
  capacity: number;
  bed_count: number;
  size_sqm?: number | null;
  price_per_night: string; // DRF Decimal приходит строкой
  description?: string;
  amenities?: Amenity[];
  quantity: number;
  is_active: boolean;
  images?: RoomImage[];
}

export type HotelType = 'hotel' | 'hostel' | 'guesthouse' | 'apart' | 'other';

export interface Hotel {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type: HotelType;
  type_display: string;
  stars?: number | null;
  address: string;
  latitude: string;
  longitude: string;
  phone?: string;
  email?: string;
  instagram?: string;
  telegram?: string;
  website?: string;
  check_in_time?: string;
  check_out_time?: string;
  amenities?: Amenity[];
  images?: HotelImage[];
  rooms?: Room[];
  reservation_mode?: 'auto' | 'manual';
  reservation_mode_display?: string;
  min_booking_hours?: number;
  min_price?: number | null;
  rating: number | null;
  review_count?: number;
  main_image?: string | null;
}

export interface HotelAvailabilityRoom {
  id: number;
  name: string;
  type: RoomType;
  capacity: number;
  price_per_night: number;
  available: boolean;
}

export interface HotelAvailability {
  check_in: string;
  check_out: string;
  nights: number;
  rooms: HotelAvailabilityRoom[];
}

export type HotelBookingStatus = 'pending' | 'confirmed' | 'canceled' | 'completed' | 'no_show';

export interface HotelBooking {
  id: number;
  hotel: number;
  hotel_name: string;
  hotel_slug: string;
  room: number | null;
  room_name?: string | null;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  guest_count: number;
  notes?: string;
  total_price: string | null;
  status: HotelBookingStatus;
  status_display: string;
  cancel_reason?: string;
  created_at: string;
}

export interface HotelBookingCreate {
  hotel: number;
  room: number;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  notes?: string;
  guest_name?: string;
  guest_phone?: string;
}
