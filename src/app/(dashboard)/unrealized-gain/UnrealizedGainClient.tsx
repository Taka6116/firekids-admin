"use client";

import { useMemo, useRef } from "react";

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

const GAIN_BAR_MAX_MAN = 50; // ±50万円相当をバー最大幅に正規化（数値は万円）

function monthsSincePurchase(purchaseDate: string): number {
  const start = new Date(`${purchaseDate}T12:00:00`);
  const now = new Date();
  const ms = now.getTime() - start.getTime();
  return Math.max(0, ms / (1000 * 60 * 60 * 24 * 30.44));
}

function formatMonthsAgoLabel(months: number): string {
  const m = Math.max(0, Math.round(months));
  if (m === 0) return "1ヶ月未満";
  return `${m}ヶ月前`;
}

function unrealizedActionBadge(gainRate: number, unrealizedGain: number, monthsHeld: number) {
  if (gainRate >= 15) {
    return (
      <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        売却検討
      </span>
    );
  }
  if (gainRate >= 5 && gainRate < 15) {
    return (
      <span className="inline-block rounded-full border border-stone-200 bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-600">
        保持
      </span>
    );
  }
  if (unrealizedGain < 0 && monthsHeld >= 6) {
    return (
      <span className="alert-pulse inline-block rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
        要対応
      </span>
    );
  }
  if (unrealizedGain < 0) {
    return (
      <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
        様子見
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full border border-stone-200 bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-600">
      保持
    </span>
  );
}

function GainProgressBar({ gainMan }: { gainMan: number }) {
  const ratio = Math.min(Math.abs(gainMan) / GAIN_BAR_MAX_MAN, 1);
  const barPx = ratio * 30; // 中央から最大30px
  if (gainMan >= 0) {
    return (
      <div className="relative h-2 w-[60px] rounded-full bg-stone-100">
        <div
          className="absolute left-1/2 top-0 h-2 rounded-r-full bg-emerald-400"
          style={{ width: `${barPx}px` }}
        />
      </div>
    );
  }
  return (
    <div className="relative h-2 w-[60px] rounded-full bg-stone-100">
      <div
        className="absolute right-1/2 top-0 h-2 rounded-l-full bg-red-400"
        style={{ width: `${barPx}px` }}
      />
    </div>
  );
}

export function UnrealizedGainClient() {
  const data: UnrealizedGainItem[] = mockUnrealizedGainItems;
  const tableRef = useRef<HTMLDivElement>(null);

  const totalGain = useMemo(() => data.reduce((s, r) => s + r.unrealized_gain, 0), [data]);
  const avgGainRate = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.round((data.reduce((s, r) => s + r.gain_rate, 0) / data.length) * 10) / 10;
  }, [data]);
  const sellReviewCount = useMemo(() => data.filter((r) => r.gain_rate >= 15).length, [data]);
  const lossCount = useMemo(() => data.filter((r) => r.unrealized_gain < 0).length, [data]);
  const criticalLossRows = useMemo(
    () => data.filter((r) => r.unrealized_gain < 0 && monthsSincePurchase(r.purchase_date) >= 6),
    [data],
  );

  const actionBannerItem = useMemo(() => {
    const losses = data.filter((r) => r.unrealized_gain < 0);
    if (losses.length === 0) return null;
    return losses.reduce((best, r) =>
      monthsSincePurchase(r.purchase_date) > monthsSincePurchase(best.purchase_date) ? r : best,
    losses[0]);
  }, [data]);

  function scrollToTable() {
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <span className="rounded border border-stone-200 px-2 py-0.5 text-xs text-stone-400">
          モックデータ表示中
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription>在庫総含み益</CardDescription>
            <CardTitle
              className={`text-5xl font-bold tabular-nums leading-tight ${
                totalGain >= 0 ? "text-emerald-600" : "text-red-700"
              }`}
            >
              {totalGain >= 0 ? "+" : ""}
              {totalGain.toLocaleString()}
              <span className="text-2xl font-semibold">万円</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>全在庫の含み益合計</p>
            <p className="font-medium text-stone-700">
              平均{" "}
              <span className={avgGainRate >= 0 ? "text-emerald-600" : "text-red-700"}>
                {avgGainRate >= 0 ? "+" : ""}
                {avgGainRate}%
              </span>
            </p>
          </CardContent>
        </DashboardCard>

        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription className="text-red-700">今すぐ売却検討</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums text-red-700 md:text-4xl">
              {sellReviewCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            含み益率が +15% 以上の銘柄（高値圏に達した銘柄）
          </CardContent>
        </DashboardCard>

        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription className="text-red-700">要注意（含み損）</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums text-red-700 md:text-4xl">
              {lossCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>市場価格が仕入価格を下回っている銘柄</p>
            {criticalLossRows.length > 0 && (
              <p className="rounded-md border border-red-200 bg-red-50 px-2 py-1.5 font-medium text-red-800">
                保有6ヶ月以上かつ含み損: {criticalLossRows.length} 銘柄 — 相場・在庫の見直しを優先してください
              </p>
            )}
          </CardContent>
        </DashboardCard>
      </div>

      {actionBannerItem && (
        <div className="mb-4 rounded-r-lg border-l-4 border-red-700 bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-800">
            ⚡ 今日対応すべき銘柄
          </p>
          <p className="mt-2 text-base font-bold text-stone-900">
            {actionBannerItem.brand} {actionBannerItem.model}
          </p>
          <p className="mt-1 text-sm text-stone-700">
            {Math.round(monthsSincePurchase(actionBannerItem.purchase_date))}ヶ月保有・
            <span className="font-semibold text-red-700 tabular-nums">
              {actionBannerItem.unrealized_gain >= 0 ? "+" : ""}
              {actionBannerItem.unrealized_gain}万
            </span>
            の含み損
          </p>
          <p className="mt-2 text-sm text-red-900">
            相場下落が続いています。売却タイミングを検討してください。
          </p>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={scrollToTable}
              className="text-sm font-medium text-red-800 underline-offset-2 hover:underline"
            >
              詳細を見る →
            </button>
          </div>
        </div>
      )}

      <div ref={tableRef}>
        <DashboardCard>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base">銘柄別含み益一覧</CardTitle>
            <CardDescription>仕入価格と現在市場価格の差分（万円）</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-hidden rounded-md border border-stone-200">
              <Table>
                <TableHeader className="bg-stone-50">
                  <TableRow className="hover:bg-stone-50 [&>th]:text-stone-500 [&>th]:text-xs [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-wide">
                    <TableHead>ブランド</TableHead>
                    <TableHead>モデル / Ref.</TableHead>
                    <TableHead className="text-right">仕入価格</TableHead>
                    <TableHead className="text-right">市場価格</TableHead>
                    <TableHead className="text-right">含み益</TableHead>
                    <TableHead className="text-right">含み益率</TableHead>
                    <TableHead className="whitespace-nowrap">仕入日</TableHead>
                    <TableHead className="text-right whitespace-nowrap">保有期間</TableHead>
                    <TableHead className="text-center">推奨アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, i) => {
                    const isPlus = row.unrealized_gain >= 0;
                    const monthsHeld = monthsSincePurchase(row.purchase_date);
                    return (
                      <TableRow
                        key={row.ref_number}
                        className={`group relative border-stone-100 transition-all duration-150 hover:bg-stone-50 ${
                          isPlus
                            ? i % 2 === 1
                              ? "bg-emerald-50/40 hover:bg-stone-50"
                              : "bg-emerald-50/20 hover:bg-stone-50"
                            : i % 2 === 1
                              ? "bg-red-50/40 hover:bg-stone-50"
                              : "bg-red-50/20 hover:bg-stone-50"
                        }`}
                      >
                        <TableCell className="border-l-[3px] border-l-transparent font-medium whitespace-nowrap text-stone-800 transition-colors duration-150 group-hover:border-l-[#8B0000]">
                          {row.brand}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[220px] truncate text-sm text-stone-700">{row.model}</div>
                          <div className="font-mono text-xs text-stone-400">{row.ref_number}</div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-stone-600">
                          {row.purchase_price.toLocaleString()}万
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm font-medium text-stone-800">
                          {row.market_price.toLocaleString()}万
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span
                              className={`tabular-nums text-sm font-semibold ${
                                row.unrealized_gain > 0
                                  ? "text-emerald-600"
                                  : row.unrealized_gain < 0
                                    ? "text-red-700"
                                    : "text-stone-500"
                              }`}
                            >
                              {row.unrealized_gain > 0 ? "+" : ""}
                              {row.unrealized_gain.toLocaleString()}万
                            </span>
                            <GainProgressBar gainMan={row.unrealized_gain} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`tabular-nums text-sm font-semibold ${
                              row.gain_rate > 0 ? "text-emerald-600" : row.gain_rate < 0 ? "text-red-700" : "text-stone-500"
                            }`}
                          >
                            {row.gain_rate > 0 ? "+" : ""}
                            {row.gain_rate}%
                          </span>
                        </TableCell>
                        <TableCell className="cursor-default text-sm text-stone-700" title={row.purchase_date}>
                          {formatMonthsAgoLabel(monthsHeld)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-stone-600">
                          {monthsHeld.toFixed(1)}ヶ月
                        </TableCell>
                        <TableCell className="text-center">
                          {unrealizedActionBadge(row.gain_rate, row.unrealized_gain, monthsHeld)}
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
    </div>
  );
}
