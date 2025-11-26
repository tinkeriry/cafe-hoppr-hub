import apiClient from "@/integrations/server/client";
import { Cafe, ApiResponse, PaginatedResponse } from "@/integrations/server/types";

// Cafes API wrapper
export async function listCafesWithReviews(): Promise<Cafe[]> {
  try {
    // The spec says GET /cafes returns a paginated response
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Cafe>>>("/cafes");
    if (data.success && data.data.cafes) {
      return data.data.cafes;
    }
    return [];
  } catch (err) {
    console.error("Error listing cafes:", err);
    // Return empty array or throw, but for now let's return empty to avoid breaking UI completely
    return [];
  }
}

export async function getCafeById(cafeId: string): Promise<Cafe | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<Cafe>>(`/cafes/${cafeId}`);
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (err) {
    console.error(`Error getting cafe ${cafeId}:`, err);
    return null;
  }
}

export interface CafeCreatePayload {
  token: string;
  name: string;
  cafe_photos?: File[];
  cafe_location_link: string;
  operational_days: string[];
  opening_hour: string;
  closing_hour: string;
  location_id: string;
  // Review fields (optional)
  review?: string;
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
  contributor_name?: string;
}

export async function createCafe(payload: CafeCreatePayload): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("token", payload.token);
    formData.append("name", payload.name);
    if (payload.cafe_photos) {
      payload.cafe_photos.forEach((photo) => {
        formData.append("cafe_photos", photo);
      });
    }
    formData.append("cafe_location_link", payload.cafe_location_link);
    formData.append("location_id", payload.location_id);
    formData.append("operational_days", JSON.stringify(payload.operational_days));
    formData.append("opening_hour", payload.opening_hour);
    formData.append("closing_hour", payload.closing_hour);

    // Add review fields if provided
    if (payload.review) formData.append("review", payload.review);
    if (payload.price !== undefined) formData.append("price", payload.price.toString());
    if (payload.wifi !== undefined) formData.append("wifi", payload.wifi.toString());
    if (payload.seat_comfort !== undefined)
      formData.append("seat_comfort", payload.seat_comfort.toString());
    if (payload.electricity_socket !== undefined)
      formData.append("electricity_socket", payload.electricity_socket.toString());
    if (payload.food_beverage !== undefined)
      formData.append("food_beverage", payload.food_beverage.toString());
    if (payload.praying_room !== undefined)
      formData.append("praying_room", payload.praying_room.toString());
    if (payload.hospitality !== undefined)
      formData.append("hospitality", payload.hospitality.toString());
    if (payload.toilet !== undefined) formData.append("toilet", payload.toilet.toString());
    if (payload.noise !== undefined) formData.append("noise", payload.noise.toString());
    if (payload.parking !== undefined) formData.append("parking", payload.parking.toString());
    if (payload.contributor_name) formData.append("contributor_name", payload.contributor_name);

    const { data } = await apiClient.post<ApiResponse<{ cafe_id: string }>>("/cafes", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (data.success) {
      return data.data.cafe_id;
    }
    throw new Error("Failed to create cafe");
  } catch (err) {
    console.error("Error creating cafe:", err);
    throw err;
  }
}

export interface CafeUpdatePayload {
  token: string;
  name?: string;
  cafe_photos?: File[];
  cafe_location_link?: string;
  operational_days?: string[];
  opening_hour?: string;
  closing_hour?: string;
  location_id?: string;
}

export async function updateCafe(cafeId: string, payload: CafeUpdatePayload): Promise<void> {
  try {
    const formData = new FormData();
    formData.append("token", payload.token);
    if (payload.name) formData.append("name", payload.name);
    if (payload.cafe_photos) {
      payload.cafe_photos.forEach((photo) => {
        formData.append("cafe_photos", photo);
      });
    }
    if (payload.cafe_location_link)
      formData.append("cafe_location_link", payload.cafe_location_link);
    if (payload.location_id) formData.append("location_id", payload.location_id);
    if (payload.operational_days)
      formData.append("operational_days", JSON.stringify(payload.operational_days));
    if (payload.opening_hour) formData.append("opening_hour", payload.opening_hour);
    if (payload.closing_hour) formData.append("closing_hour", payload.closing_hour);

    await apiClient.put<ApiResponse<{ message: string; request_id: number }>>("/cafes", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (err) {
    console.error("Error updating cafe:", err);
    throw err;
  }
}
