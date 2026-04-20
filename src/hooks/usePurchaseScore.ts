"use client";

import { useMemo } from "react";
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
    if (filters.brand && row.brand !== filters.brand) return false;
    if (filters.channel && row.channel !== filters.channel) return false;
    if (filters.price_band && row.price_band !== filters.price_band) return false;
    return true;
  });
}

/** 全件を1回だけ取得するクエリ。フィルタリングはクライアント側で行う */
function usePurchaseScoreAll() {
  return useQuery({
    queryKey: ["purchase-score-all"],
    queryFn: async (): Promise<PurchaseScoreItem[]> => {
      if (USE_MOCK) {
        return mockPurchaseScores;
      }
      const { data: raw } = await apiClient.get<unknown>("/admin/purchase-score");
      const parsed = purchaseScoreResponseSchema.parse(raw);
      return parsed.scores;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** フィルター付きで使う場合はクライアント側でメモ化して絞り込む */
export function usePurchaseScore(filters: PurchaseScoreFilters = {}) {
  const query = usePurchaseScoreAll();

  const data = useMemo(() => {
    if (!query.data) return undefined;
    return filterScores(query.data, filters);
    // filtersオブジェクトの各フィールドを依存配列に展開して安定させる
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, filters.brand, filters.channel, filters.price_band]);

  return {
    ...query,
    data,
  };
}
