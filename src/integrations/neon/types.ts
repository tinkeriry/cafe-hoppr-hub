export interface Location {
  location_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  review_id: string;
  cafe_id: string;
  review: string;
  star_rating: number;
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

export interface Cafe {
  cafe_id: string;
  name: string;
  cafe_photo: string;
  cafe_location_link: string;
  location_id?: string;
  location_name?: string;
  operational_days?: string[];
  opening_hour?: string; // HH:MM
  closing_hour?: string; // HH:MM
  status: string;
  created_at: string;
  updated_at: string;
  // Multiple reviews per cafe
  reviews?: Review[];
}

export interface CafeFormData {
  // Page 1 - Basic Info
  name: string;
  cafe_photo: string;
  cafe_location_link: string;
  location_id: string;
  review: string;
  star_rating: number;
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
