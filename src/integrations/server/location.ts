import apiClient from "@/integrations/server/client";
import { Location, ApiResponse, PaginatedResponse } from "@/integrations/server/types";

// Locations API wrapper
export async function listLocations(): Promise<Location[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Location>>>("/locations");
    if (data.success && data.data.locations) {
      return data.data.locations;
    }
    return [];
  } catch (err) {
    console.error("Error listing locations:", err);
    return [];
  }
}
