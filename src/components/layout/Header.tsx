"use client";

import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOutUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const titles: Record<string, string> = {
  "/purchase-score": "仕入れ優先スコア",
  "/matrix": "マトリクス分析",
  "/budget-simulator": "予算シミュレータ",
  "/budget-simulator/handbook": "説明書",
};

export function Header({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const title = titles[pathname] ?? "ダッシュボード";

  async function handleSignOut() {
    try {
      await signOutUser();
    } catch {
      /* セッション切れ等は無視してログインへ */
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      className={cn(
        "no-print flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-sm print:hidden",
        className,
      )}
    >
      <h1 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 border-border text-muted-foreground hover:text-foreground"
          onClick={() => void handleSignOut()}
        >
          <LogOut className="size-3.5" aria-hidden />
          ログアウト
        </Button>
      </div>
    </header>
  );
}
