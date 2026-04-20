import { type NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";

import { runWithAmplifyServerContext } from "@/lib/amplify-server";

/**
 * ダッシュボード配下の全ルートに認証チェックをかける。
 * layout.tsx の force-dynamic + fetchAuthSession を middleware に移すことで
 * ページ遷移のたびにサーバーコンポーネントが再実行されるのを防ぐ。
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 認証ページ・静的アセット・APIルートはスキップ
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    const authenticated = await runWithAmplifyServerContext({
      nextServerContext: { request, response: NextResponse.next() },
      operation: async (contextSpec) => {
        const session = await fetchAuthSession(contextSpec);
        return Boolean(session.tokens?.idToken);
      },
    });

    if (!authenticated) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 以下を除く全リクエストにマッチ:
     * - _next/static（静的ファイル）
     * - _next/image（画像最適化）
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
