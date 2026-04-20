"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { USE_MOCK } from "@/lib/constants";
import { mockMatrixItems } from "@/lib/mockData";
import { matrixResponseSchema, type MatrixItem } from "@/types/matrix";

export type MatrixFilters = {
  channel?: MatrixItem["channel"];
};

/** 全件を1回だけ取得するクエリ。フィルタリングはクライアント側で行う */
function useMatrixAll() {
  return useQuery({
    queryKey: ["matrix-all"],
    queryFn: async (): Promise<MatrixItem[]> => {
      if (USE_MOCK) {
        return mockMatrixItems;
      }
      const { data: raw } = await apiClient.get<unknown>("/admin/matrix");
      const parsed = matrixResponseSchema.parse(raw);
      return parsed.items;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMatrix(filters: MatrixFilters = {}) {
  const query = useMatrixAll();

  const data = useMemo(() => {
    if (!query.data) return undefined;
    if (!filters.channel) return query.data;
    return query.data.filter((r) => r.channel === filters.channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, filters.channel]);

  return {
    ...query,
    data,
  };
}
