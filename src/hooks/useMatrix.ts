"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { USE_MOCK } from "@/lib/constants";
import { mockMatrixItems } from "@/lib/mockData";
import { matrixResponseSchema, type MatrixItem } from "@/types/matrix";

export type MatrixFilters = {
  channel?: MatrixItem["channel"];
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function useMatrix(filters: MatrixFilters = {}) {
  return useQuery({
    queryKey: ["matrix", filters],
    queryFn: async (): Promise<MatrixItem[]> => {
      if (USE_MOCK) {
        await delay(250);
        const rows = filters.channel
          ? mockMatrixItems.filter((r) => r.channel === filters.channel)
          : mockMatrixItems;
        return rows;
      }
      const { data: raw } = await apiClient.get<unknown>("/admin/matrix", {
        params: filters,
      });
      const parsed = matrixResponseSchema.parse(raw);
      return parsed.items;
    },
    staleTime: 5 * 60 * 1000,
  });
}
