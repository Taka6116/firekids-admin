/**
 * Step 7: バックエンド（別リポジトリ）の /admin/* とフロントの Zod 契約が一致するか検証する。
 *
 * 使い方（web ディレクトリで）:
 *   INTEGRATION_ID_TOKEN="<Cognito の idToken 文字列>" npm run verify:api
 *
 * .env.local に NEXT_PUBLIC_API_BASE_URL と INTEGRATION_ID_TOKEN を書いて
 * `npm run verify:api` だけでも可（トークンは Git に含めないこと）。
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

import { budgetSimulationSchema } from "../src/types/budget";
import { matrixResponseSchema } from "../src/types/matrix";
import { purchaseScoreResponseSchema } from "../src/types/purchaseScore";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
const token =
  process.env.INTEGRATION_ID_TOKEN?.trim() ??
  process.env.API_INTEGRATION_TOKEN?.trim() ??
  "";

async function fetchJson(path: string): Promise<unknown> {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    throw new Error(`${path}: JSON でないレスポンス (HTTP ${res.status})`);
  }
  if (!res.ok) {
    const errMsg =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : text.slice(0, 200);
    throw new Error(`${path}: HTTP ${res.status} — ${errMsg}`);
  }
  return body;
}

function ok(label: string): void {
  console.log(`OK  ${label}`);
}

function fail(label: string, err: unknown): never {
  console.error(`NG  ${label}`);
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    console.error(err);
  }
  process.exit(1);
}

async function main(): Promise<void> {
  if (!baseUrl) {
    fail("設定", new Error("NEXT_PUBLIC_API_BASE_URL が未設定です。"));
  }
  if (!token) {
    fail(
      "設定",
      new Error(
        "INTEGRATION_ID_TOKEN（または API_INTEGRATION_TOKEN）が未設定です。Cognito サインイン後の idToken を設定してください。",
      ),
    );
  }

  console.log(`API: ${baseUrl}\n`);

  try {
    const ps = await fetchJson("/admin/purchase-score");
    const psResult = purchaseScoreResponseSchema.safeParse(ps);
    if (!psResult.success) {
      fail("/admin/purchase-score", psResult.error);
    }
    ok("/admin/purchase-score（Zod: scores[]）");
  } catch (e) {
    fail("/admin/purchase-score", e);
  }

  try {
    const mx = await fetchJson("/admin/matrix");
    const mxResult = matrixResponseSchema.safeParse(mx);
    if (!mxResult.success) {
      fail("/admin/matrix", mxResult.error);
    }
    ok("/admin/matrix（Zod: items[]）");
  } catch (e) {
    fail("/admin/matrix", e);
  }

  try {
    const bd = await fetchJson("/admin/budget-simulation");
    const bdResult = budgetSimulationSchema.safeParse(bd);
    if (!bdResult.success) {
      fail("/admin/budget-simulation", bdResult.error);
    }
    ok("/admin/budget-simulation（Zod: BudgetSimulation）");
  } catch (e) {
    fail("/admin/budget-simulation", e);
  }

  console.log("\nすべての結合チェックに成功しました。");
}

void main();
