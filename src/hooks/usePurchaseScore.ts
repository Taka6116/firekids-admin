"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { USE_MOCK } from "@/lib/constants";
import { mockPurchaseScores } from "@/lib/mockData";
import {
  purchaseScoreResponseSchema,
  type PurchaseScoreItem,
} from "@/types/purchaseScore";

export type PurchaseScoreFilters = {
  brand?: string;
  channel?: string;
  price_band?: string;
};

function filterScores(
  rows: PurchaseScoreItem[],
  filters: PurchaseScoreFilters,
): PurchaseScoreItem[] {
  return rows.filter((row) => {
    if (filters.brand && row.brand !== filters.brand) {
      return false;
    }
    if (filters.channel && row.channel !== filters.channel) {
      return false;
    }
    if (filters.price_band && row.price_band !== filters.price_band) {
      return false;
    }
    return true;
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function usePurchaseScore(filters: PurchaseScoreFilters = {}) {
  return useQuery({
    queryKey: ["purchase-score", filters],
    queryFn: async (): Promise<PurchaseScoreItem[]> => {
      if (USE_MOCK) {
        await delay(250);
        return filterScores(mockPurchaseScores, filters);
      }
      const { data: raw } = await apiClient.get<unknown>(
        "/admin/purchase-score",
        { params: filters },
      );
      const parsed = purchaseScoreResponseSchema.parse(raw);
      return parsed.scores;
    },
    staleTime: 5 * 60 * 1000,
  });
}
