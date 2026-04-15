import { NextResponse } from "next/server";

/**
 * 開発環境専用: .env.local の AUTH_EMAIL / AUTH_PASSWORD を返す。
 * NODE_ENV=production では常に 404（ビルド成果物に認証情報を載せない）。
 */
export function GET(): NextResponse {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse(null, { status: 404 });
  }

  const email = process.env.AUTH_EMAIL?.trim();
  const password = process.env.AUTH_PASSWORD;

  if (!email || !password) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json(
    { email, password },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
