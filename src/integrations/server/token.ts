import apiClient from "@/integrations/server/client";
import { ApiResponse, TokenValidationResponse } from "@/integrations/server/types";

export async function validateToken(token: string): Promise<TokenValidationResponse | null> {
  try {
    const { data } = await apiClient.post<ApiResponse<TokenValidationResponse>>(
      "/tokens/validate",
      { token }
    );
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (err) {
    console.error("Error validating token:", err);
    return null;
  }
}
