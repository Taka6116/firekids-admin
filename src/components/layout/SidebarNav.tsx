"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/purchase-score", label: "仕入れ優先スコア" },
  { href: "/matrix", label: "マトリクス分析" },
  { href: "/budget-simulator", label: "予算シミュレータ" },
] as const;

const handbookHref = "/budget-simulator/handbook";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-muted font-medium text-foreground ring-1 ring-foreground/15"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <Link
        href={handbookHref}
        className={cn(
          "rounded-md px-3 py-2 text-sm transition-colors",
          pathname === handbookHref
            ? "bg-muted font-medium text-foreground ring-1 ring-foreground/15"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        説明書
      </Link>
    </nav>
  );
}
