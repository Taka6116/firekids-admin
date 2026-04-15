import { z } from "zod";

export const matrixChannelSchema = z.enum([
  "auction",
  "dealer",
  "individual",
]);

export const matrixItemSchema = z.object({
  brand: z.string(),
  model: z.string(),
  x_turnover: z.number(),
  y_gross_margin: z.number(),
  bubble_size: z.number(),
  channel: matrixChannelSchema,
});

export const matrixResponseSchema = z.object({
  items: z.array(matrixItemSchema),
});

export type MatrixItem = z.infer<typeof matrixItemSchema>;
