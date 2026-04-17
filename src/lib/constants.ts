export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/** `NEXT_PUBLIC_USE_MOCK=true` のとき API を呼ばずモックを返す */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
