import apiClient from "@/integrations/server/client";
import { Review } from "@/integrations/server/types";

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

export async function listContributors(): Promise<string[]> {
  try {
    const { data } = await apiClient.get<string[]>("/reviews/contributors");
    return data;
  } catch (err) {
    return ["Guest", "Anonymous"];
  }
}

export type ReviewCreatePayload = Omit<Review, "review_id" | "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
};

export async function createReview(payload: ReviewCreatePayload): Promise<string> {
  try {
    const { data } = await apiClient.post<{ review_id: string }>("/reviews", payload);
    return data.review_id;
  } catch (err) {
    return crypto.randomUUID();
  }
}

export type ReviewUpdatePayload = Partial<Omit<Review, "review_id" | "cafe_id" | "created_at">> & {
  updated_at?: string;
};

export async function updateReview(reviewId: string, payload: ReviewUpdatePayload): Promise<void> {
  try {
    await apiClient.put(`/reviews/${reviewId}`, payload);
  } catch (err) {
    // no-op for dummy
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  try {
    await apiClient.delete(`/reviews/${reviewId}`);
  } catch (err) {
    // no-op for dummy
  }
}
