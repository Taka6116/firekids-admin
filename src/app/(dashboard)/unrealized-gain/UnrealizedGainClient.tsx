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
import { mockUnrealizedGainItems, type UnrealizedGainItem } from "@/lib/mockData";

function GainCell({ value, suffix = "" }: { value: number; suffix?: string }) {
  const color =
    value > 0 ? "text-emerald-600" : value < 0 ? "text-red-700" : "text-stone-500";
  const sign = value > 0 ? "+" : "";
  return (
    <span className={`tabular-nums text-sm font-medium ${color}`}>
      {sign}{value.toLocaleString()}{suffix}
    </span>
  );
}

export function UnrealizedGainClient() {
  const data: UnrealizedGainItem[] = mockUnrealizedGainItems;

  const totalGain = useMemo(
    () => data.reduce((s, r) => s + r.unrealized_gain, 0),
    [data],
  );
  const plusCount = useMemo(() => data.filter((r) => r.unrealized_gain > 0).length, [data]);
  const minusCount = useMemo(() => data.filter((r) => r.unrealized_gain < 0).length, [data]);

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
        現在はモックデータを表示しています。本番環境では在庫管理システムおよび市場価格 API と連携します。
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription>在庫総含み益</CardDescription>
            <CardTitle
              className={`text-3xl font-semibold tabular-nums ${
                totalGain >= 0 ? "text-emerald-600" : "text-red-700"
              }`}
            >
              {totalGain >= 0 ? "+" : ""}{totalGain.toLocaleString()}万円
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            全在庫の（市場価格 − 仕入価格）の合計
          </CardContent>
        </DashboardCard>
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription>含み益プラス銘柄数</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums text-emerald-600">
              {plusCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            市場価格が仕入価格を上回っている銘柄
          </CardContent>
        </DashboardCard>
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription>含み損銘柄数</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums text-red-700">
              {minusCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            市場価格が仕入価格を下回っている銘柄
          </CardContent>
        </DashboardCard>
      </div>

      <DashboardCard>
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-base">銘柄別含み益一覧</CardTitle>
          <CardDescription>仕入価格と現在市場価格の差分（万円）</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-md border border-stone-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-stone-50">
                <TableRow className="hover:bg-stone-50 [&>th]:text-stone-500 [&>th]:text-xs [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-wide">
                  <TableHead>ブランド</TableHead>
                  <TableHead>モデル / Ref.</TableHead>
                  <TableHead className="text-right">仕入価格</TableHead>
                  <TableHead className="text-right">市場価格</TableHead>
                  <TableHead className="text-right">含み益</TableHead>
                  <TableHead className="text-right">含み益率</TableHead>
                  <TableHead>仕入日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => {
                  const isPlus = row.unrealized_gain >= 0;
                  return (
                    <TableRow
                      key={row.ref_number}
                      className={`border-stone-100 transition-colors ${
                        isPlus
                          ? i % 2 === 1
                            ? "bg-emerald-50/40 hover:bg-emerald-50/70"
                            : "bg-emerald-50/20 hover:bg-emerald-50/50"
                          : i % 2 === 1
                          ? "bg-red-50/40 hover:bg-red-50/70"
                          : "bg-red-50/20 hover:bg-red-50/50"
                      }`}
                    >
                      <TableCell className="font-medium text-stone-800 whitespace-nowrap">
                        {row.brand}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-stone-700 max-w-[220px] truncate">{row.model}</div>
                        <div className="font-mono text-xs text-stone-400">{row.ref_number}</div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm text-stone-600">
                        {row.purchase_price.toLocaleString()}万
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm text-stone-800">
                        {row.market_price.toLocaleString()}万
                      </TableCell>
                      <TableCell className="text-right">
                        <GainCell value={row.unrealized_gain} suffix="万" />
                      </TableCell>
                      <TableCell className="text-right">
                        <GainCell value={row.gain_rate} suffix="%" />
                      </TableCell>
                      <TableCell className="text-sm text-stone-500 font-mono whitespace-nowrap">
                        {row.purchase_date}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </DashboardCard>
    </div>
  );
}
