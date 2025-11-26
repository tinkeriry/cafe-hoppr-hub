import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCafesWithReviews,
  getCafeById,
  createCafe,
  updateCafe,
  CafeCreatePayload,
  CafeUpdatePayload,
} from "@/integrations/server/cafe";
import { listLocations } from "@/integrations/server/location";
import { validateToken } from "@/integrations/server/token";

// Query Keys
export const CAFE_KEYS = {
  all: ["cafes"] as const,
  lists: () => [...CAFE_KEYS.all, "list"] as const,
  detail: (id: string) => [...CAFE_KEYS.all, "detail", id] as const,
};

export const LOCATION_KEYS = {
  all: ["locations"] as const,
  lists: () => [...LOCATION_KEYS.all, "list"] as const,
};

export const CONTRIBUTOR_KEYS = {
  all: ["contributors"] as const,
  lists: () => [...CONTRIBUTOR_KEYS.all, "list"] as const,
};

// Queries

export function useCafes() {
  return useQuery({
    queryKey: CAFE_KEYS.lists(),
    queryFn: listCafesWithReviews,
  });
}

export function useCafe(id: string | undefined) {
  return useQuery({
    queryKey: CAFE_KEYS.detail(id || ""),
    queryFn: () => getCafeById(id!),
    enabled: !!id,
  });
}

export function useLocations() {
  return useQuery({
    queryKey: LOCATION_KEYS.lists(),
    queryFn: listLocations,
  });
}

export function useTokenValidation(token: string | null) {
  return useQuery({
    queryKey: ["token", token],
    queryFn: () => validateToken(token!),
    enabled: !!token,
    retry: false,
  });
}

// Mutations

export function useCreateCafe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CafeCreatePayload) => createCafe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAFE_KEYS.lists() });
    },
  });
}

export function useUpdateCafe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CafeUpdatePayload }) =>
      updateCafe(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CAFE_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: CAFE_KEYS.lists() });
    },
  });
}
