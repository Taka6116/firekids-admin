import { z } from "zod";

export const purchaseScoreChannelSchema = z.enum([
  "auction",
  "dealer",
  "individual",
]);

export const purchaseScoreActionSchema = z.enum([
  "priority",
  "normal",
  "hold",
]);

export const purchaseScoreItemSchema = z.object({
  rank: z.number(),
  brand: z.string(),
  model: z.string(),
  ref_number: z.string(),
  score: z.number(),
  turnover_months: z.number(),
  stock_count: z.number(),
  price_band: z.string(),
  channel: purchaseScoreChannelSchema,
  action: purchaseScoreActionSchema,
});

export const purchaseScoreResponseSchema = z.object({
  scores: z.array(purchaseScoreItemSchema),
});

export type PurchaseScoreItem = z.infer<typeof purchaseScoreItemSchema>;
