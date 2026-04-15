import { z } from "zod";

export const dealerBudgetSchema = z.object({
  name: z.string(),
  amount: z.number(),
  ratio: z.number(),
});

export const budgetChannelSchema = z.object({
  name: z.string(),
  current_amount: z.number(),
  suggested_amount: z.number(),
  current_ratio: z.number(),
  suggested_ratio: z.number(),
  purchase_count: z.number(),
  dealers: z.array(dealerBudgetSchema).optional(),
});

export const budgetSimulationSchema = z.object({
  total_budget: z.number(),
  month: z.string(),
  channels: z.object({
    auction: budgetChannelSchema,
    dealer: budgetChannelSchema,
    individual: budgetChannelSchema,
  }),
});

export type BudgetSimulation = z.infer<typeof budgetSimulationSchema>;
export type BudgetChannel = z.infer<typeof budgetChannelSchema>;
export type DealerBudget = z.infer<typeof dealerBudgetSchema>;
