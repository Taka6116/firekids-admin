"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const primaryItems = [
  { href: "/purchase-score", label: "仕入れ優先スコア" },
  { href: "/matrix", label: "マトリクス分析" },
  { href: "/budget-simulator", label: "予算シミュレータ" },
] as const;

const newItems = [
  { href: "/market-watch", label: "市場価格ウォッチ" },
  { href: "/unrealized-gain", label: "含み益トラッカー" },
  { href: "/turnover-alert", label: "回転率アラート" },
] as const;

const handbookHref = "/handbook";

export function SidebarNav() {
  const pathname = usePathname();

  function linkClass(href: string) {
    const active = pathname === href;
    return cn(
      "rounded-md px-3 py-2 text-sm transition-colors",
      active
        ? "bg-muted font-medium text-foreground ring-1 ring-foreground/15"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );
  }

  return (
    <nav className="flex flex-col gap-1">
      {primaryItems.map((item) => (
        <Link key={item.href} href={item.href} className={linkClass(item.href)}>
          {item.label}
        </Link>
      ))}

      <div className="my-2 border-t border-border" />

      {newItems.map((item) => (
        <Link key={item.href} href={item.href} className={linkClass(item.href)}>
          <span className="flex items-center justify-between">
            {item.label}
            <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-red-700">
              NEW
            </span>
          </span>
        </Link>
      ))}

      <div className="my-2 border-t border-border" />

      <Link href={handbookHref} className={linkClass(handbookHref)}>
        説明書
      </Link>
    </nav>
  );
}
