"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { USE_MOCK } from "@/lib/constants";
import { mockBudgetSimulation } from "@/lib/mockData";
import { budgetSimulationSchema, type BudgetSimulation } from "@/types/budget";

export function useBudget() {
  return useQuery({
    queryKey: ["budget-simulation"],
    queryFn: async (): Promise<BudgetSimulation> => {
      if (USE_MOCK) {
        return mockBudgetSimulation;
      }
      const { data: raw } = await apiClient.get<unknown>(
        "/admin/budget-simulation",
      );
      return budgetSimulationSchema.parse(raw);
    },
    staleTime: 5 * 60 * 1000,
  });
}
