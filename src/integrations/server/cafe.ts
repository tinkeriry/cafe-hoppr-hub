import apiClient from "@/integrations/server/client";
import { Cafe } from "@/integrations/server/types";

// Cafes API wrapper
export async function listCafesWithReviews(): Promise<Cafe[]> {
  try {
    const { data } = await apiClient.get<Cafe[]>("/cafes");
    return data;
  } catch (err) {
    // Dummy list
    const now = new Date().toISOString();
    return [
      {
        cafe_id: "cafe-1",
        name: "Dummy Cafe",
        cafe_photo: "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e",
        cafe_location_link: "https://maps.google.com/?q=Dummy+Cafe",
        location_id: "loc-1",
        operational_days: ["MON", "TUE", "WED", "THU", "FRI"],
        opening_hour: "08:00",
        closing_hour: "18:00",
        status: "approved",
        created_at: now,
        updated_at: now,
        reviews: [
          {
            review_id: "rev-1",
            cafe_id: "cafe-1",
            review: "Cozy place with good Wi-Fi",
            price: 7,
            wifi: 8,
            seat_comfort: 8,
            electricity_socket: 7,
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
        ],
      },
    ];
  }
}

export async function getCafeById(cafeId: string): Promise<Cafe | null> {
  try {
    const { data } = await apiClient.get<Cafe>(`/cafes/${cafeId}`);
    return data;
  } catch (err) {
    // Dummy cafe
    const list = await listCafesWithReviews();
    return list.find((c) => c.cafe_id === cafeId) || list[0] || null;
  }
}

export type CafeCreatePayload = Omit<Cafe, "reviews" | "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
};

export async function createCafe(payload: CafeCreatePayload): Promise<string> {
  try {
    const { data } = await apiClient.post<{ cafe_id: string }>("/cafes", payload);
    return data.cafe_id;
  } catch (err) {
    return payload.cafe_id || crypto.randomUUID();
  }
}

export type CafeUpdatePayload = Partial<CafeCreatePayload>;

export async function updateCafe(cafeId: string, payload: CafeUpdatePayload): Promise<void> {
  try {
    await apiClient.put(`/cafes/${cafeId}`, payload);
  } catch (err) {
    // no-op for dummy
  }
}

export async function deleteCafe(cafeId: string): Promise<void> {
  try {
    await apiClient.delete(`/cafes/${cafeId}`);
  } catch (err) {
    // no-op for dummy
  }
}
