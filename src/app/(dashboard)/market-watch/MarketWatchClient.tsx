"use client";

import { useMemo } from "react";

import { DashboardCard } from "@/components/layout/DashboardCard";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockMarketWatchItems, type MarketWatchItem } from "@/lib/mockData";

function TrendBadge({ change }: { change: number }) {
  if (change > 0)
    return (
      <span className="font-bold text-emerald-600">↑</span>
    );
  if (change < 0)
    return (
      <span className="font-bold text-red-700">↓</span>
    );
  return <span className="text-stone-400">→</span>;
}

function ChangeCell({ value, suffix = "" }: { value: number; suffix?: string }) {
  const color =
    value > 0 ? "text-emerald-600" : value < 0 ? "text-red-700" : "text-stone-500";
  const sign = value > 0 ? "+" : "";
  return (
    <span className={`tabular-nums text-sm font-medium ${color}`}>
      {sign}{value.toLocaleString()}{suffix}
    </span>
  );
}

export function MarketWatchClient() {
  const data: MarketWatchItem[] = mockMarketWatchItems;

  const risingCount = useMemo(() => data.filter((r) => r.change_amount > 0).length, [data]);
  const fallingCount = useMemo(() => data.filter((r) => r.change_amount < 0).length, [data]);
  const avgRate = useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((s, r) => s + r.change_rate, 0);
    return Math.round((sum / data.length) * 10) / 10;
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
        現在はモックデータを表示しています。本番環境では外部市場価格 API と連携します。
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription>今週の値上がり銘柄数</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums text-emerald-600">
              {risingCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            先週比でプラスの銘柄
          </CardContent>
        </DashboardCard>
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription>今週の値下がり銘柄数</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums text-red-700">
              {fallingCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            先週比でマイナスの銘柄
          </CardContent>
        </DashboardCard>
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription>平均価格変動率</CardDescription>
            <CardTitle
              className={`text-3xl font-semibold tabular-nums ${
                avgRate > 0 ? "text-emerald-600" : avgRate < 0 ? "text-red-700" : "text-stone-700"
              }`}
            >
              {avgRate > 0 ? "+" : ""}{avgRate}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            全銘柄の変動率の単純平均
          </CardContent>
        </DashboardCard>
      </div>

      <DashboardCard>
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-base">銘柄別価格推移</CardTitle>
          <CardDescription>先週・今週の市場参考価格（万円）と変動</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-md border border-stone-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-stone-50">
                <TableRow className="hover:bg-stone-50 [&>th]:text-stone-500 [&>th]:text-xs [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-wide">
                  <TableHead>ブランド</TableHead>
                  <TableHead>モデル / Ref.</TableHead>
                  <TableHead className="text-right">先週（万円）</TableHead>
                  <TableHead className="text-right">今週（万円）</TableHead>
                  <TableHead className="text-right">変動額</TableHead>
                  <TableHead className="text-right">変動率</TableHead>
                  <TableHead className="text-center">傾向</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow
                    key={row.ref_number}
                    className={`border-stone-100 transition-colors ${
                      i % 2 === 1 ? "bg-stone-50/50 hover:bg-stone-100/50" : "hover:bg-stone-50"
                    }`}
                  >
                    <TableCell className="font-medium text-stone-800 whitespace-nowrap">
                      {row.brand}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-stone-700 max-w-[240px] truncate">{row.model}</div>
                      <div className="font-mono text-xs text-stone-400">{row.ref_number}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm text-stone-600">
                      {row.last_week_price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm font-medium text-stone-800">
                      {row.this_week_price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <ChangeCell value={row.change_amount} suffix="万" />
                    </TableCell>
                    <TableCell className="text-right">
                      <ChangeCell value={row.change_rate} suffix="%" />
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendBadge change={row.change_amount} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </DashboardCard>
    </div>
  );
}
