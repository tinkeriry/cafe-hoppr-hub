export interface Cafe {
  cafe_id: string;
  name: string;
  cafe_photo: string;
  cafe_location_link: string;
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
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CafeFormData {
  // Page 1 - Basic Info
  name: string;
  cafe_photo: string;
  cafe_location_link: string;
  review: string;
  star_rating: number;
  
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
