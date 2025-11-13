import apiClient from "@/integrations/server/client";
import { Location } from "@/integrations/server/types";

// Locations API wrapper
export async function listLocations(): Promise<Location[]> {
  try {
    const { data } = await apiClient.get<Location[]>("/locations");
    return data;
  } catch (err) {
    // Fallback dummy data
    return [
      {
        location_id: "loc-1",
        name: "Jakarta",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        location_id: "loc-2",
        name: "Bandung",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
}
