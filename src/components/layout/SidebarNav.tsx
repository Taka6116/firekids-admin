"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  TrendingUp,
  BarChart2,
  Calculator,
  Globe,
  DollarSign,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

import { cn } from "@/lib/utils";

const primaryItems = [
  { href: "/purchase-score",   label: "仕入れ優先スコア", Icon: TrendingUp },
  { href: "/matrix",           label: "マトリクス分析",   Icon: BarChart2 },
  { href: "/budget-simulator", label: "予算シミュレータ", Icon: Calculator },
] as const;

const newItems = [
  { href: "/market-watch",    label: "市場価格ウォッチ", Icon: Globe },
  { href: "/unrealized-gain", label: "含み益トラッカー",  Icon: DollarSign },
  { href: "/turnover-alert",  label: "回転率アラート",   Icon: AlertTriangle },
] as const;

const handbookHref = "/handbook";

export function SidebarNav() {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // ナビゲーション完了時にペンディング状態をリセット
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  function NavLink({
    href,
    label,
    Icon,
  }: {
    href: string;
    label: string;
    Icon: React.ElementType;
  }) {
    const active = pathname === href || pendingHref === href;
    const isPending = pendingHref === href && pathname !== href;

    return (
      <Link
        href={href}
        onClick={() => {
          if (href !== pathname) setPendingHref(href);
        }}
        className={cn(
          "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all duration-150",
          active
            ? "border-l-[3px] border-[#8B0000] bg-red-50 font-medium text-[#8B0000]"
            : "border-l-[3px] border-transparent text-muted-foreground hover:bg-red-50/60 hover:text-foreground",
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-colors duration-150",
            active ? "text-[#8B0000]" : "text-stone-400 group-hover:text-stone-600",
            isPending && "animate-pulse",
          )}
        />
        <span className="flex-1 leading-none">{label}</span>
        {isPending && (
          <span className="h-1.5 w-1.5 rounded-full bg-[#8B0000] animate-ping opacity-75" />
        )}
      </Link>
    );
  }

  return (
    <nav className="flex flex-col gap-0.5">
      {primaryItems.map((item) => (
        <NavLink key={item.href} href={item.href} label={item.label} Icon={item.Icon} />
      ))}

      <div className="my-2 border-t border-border" />

      {newItems.map((item) => (
        <NavLink key={item.href} href={item.href} label={item.label} Icon={item.Icon} />
      ))}

      <div className="my-2 border-t border-border" />

      <NavLink href={handbookHref} label="説明書" Icon={BookOpen} />
    </nav>
  );
}
