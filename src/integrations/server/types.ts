export interface Location {
  location_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  review_id: string;
  cafe_id: string;
  review: string;
  price: number;
  wifi: number;
  seat_comfort: number;
  electricity_socket: number;
  food_beverage: number;
  praying_room: number;
  hospitality: number;
  toilet: number;
  noise: number;
  parking: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CafePhoto {
  id: number;
  cafe_id: string;
  photo_url: string;
  is_primary: boolean;
  order: number;
  created_at: string;
}

export interface Cafe {
  cafe_id: string;
  name: string;
  cafe_photo?: string; // Deprecated, kept for backward compatibility
  cafe_location_link: string;
  status: string;
  operational_days: string[];
  opening_hour: string; // ISO8601 format from API
  closing_hour: string; // ISO8601 format from API
  location_id: string;
  contributor_name?: string;
  location?: Location; // For detail view
  locations?: Location; // For list view (spec has "locations" object in list item)
  photos?: CafePhoto[]; // Array of photos
  created_at?: string;
  updated_at?: string;
  reviews?: Review[]; // Optional, present in detail view
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface Pagination {
  current_page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface PaginatedResponse<T> {
  cafes?: T[]; // For cafes list
  locations?: T[]; // For locations list
  pagination: Pagination;
  filters_applied: Record<string, any>;
}

export interface TokenValidationResponse {
  isValid: boolean;
  type: "add_cafe" | "edit_cafe";
  request_id: number;
  expires_at: string;
  cafe_id?: string;
  cafe?: {
    name: string;
    cafe_photo: string;
    cafe_location_link: string;
    operational_days: string[];
    opening_hour: string;
    closing_hour: string;
    location_id: string;
  };
}

export interface CafeFormData {
  // Page 1 - Basic Info
  name: string;
  cafe_photo: string;
  cafe_location_link: string;
  location_id: string;
  review: string;
  operational_days: string[];
  opening_hour: string;
  closing_hour: string;
  contributor_name: string;

  // Page 2 - Details
  price: number;
  wifi: number;
  seat_comfort: number;
  electricity_socket: number;
  food_beverage: number;
  praying_room: number;
  hospitality: number;
  toilet: number;
  noise: number;
  parking: number;
}
