import apiClient from "@/integrations/server/client";
import { ApiResponse, Review } from "@/integrations/server/types";

// Reviews API wrapper
export async function listReviewsByCafe(cafeId: string): Promise<Review[]> {
  try {
    const { data } = await apiClient.get<Review[]>(`/cafes/${cafeId}/reviews`);
    return data;
  } catch (err) {
    const now = new Date().toISOString();
    return [
      {
        review_id: "rev-1",
        cafe_id: cafeId,
        review: "Nice ambiance and good coffee",
        price: 7,
        wifi: 8,
        seat_comfort: 7,
        electricity_socket: 6,
        food_beverage: 8,
        praying_room: 0,
        hospitality: 9,
        toilet: 7,
        noise: 5,
        parking: 6,
        created_by: "Guest",
        created_at: now,
        updated_at: now,
      },
    ];
  }
}

// Create a new review (add_review token required)
export async function createReview(payload: {
  token: string;
  cafe_id: string;
  reviewer_name: string;
  review: string;
  price?: number;
  wifi?: number;
  seat_comfort?: number;
  electricity_socket?: number;
  food_beverage?: number;
  praying_room?: number;
  hospitality?: number;
  toilet?: number;
  noise?: number;
  parking?: number;
}): Promise<ApiResponse<Review>> {
  try {
    const { data } = await apiClient.post("/reviews", payload);
    return data;
  } catch (err) {
    console.error("Error creating review:", err);
    throw err;
  }
}
