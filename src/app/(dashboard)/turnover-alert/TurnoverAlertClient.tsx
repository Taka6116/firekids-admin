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
import { mockTurnoverAlertItems, type TurnoverAlertItem } from "@/lib/mockData";

const alertConfig: Record<
  TurnoverAlertItem["alert_level"],
  { label: string; badgeClass: string; rowClass: string }
> = {
  red: {
    label: "要対応",
    badgeClass: "bg-red-100 text-red-700 border border-red-200",
    rowClass: "bg-red-50/30 hover:bg-red-50/60",
  },
  yellow: {
    label: "注意",
    badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
    rowClass: "bg-amber-50/30 hover:bg-amber-50/60",
  },
  green: {
    label: "正常",
    badgeClass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    rowClass: "hover:bg-stone-50",
  },
};

export function TurnoverAlertClient() {
  const data: TurnoverAlertItem[] = mockTurnoverAlertItems;

  const redCount = useMemo(() => data.filter((r) => r.alert_level === "red").length, [data]);
  const avgElapsed = useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((s, r) => s + r.elapsed_months, 0);
    return Math.round((sum / data.length) * 10) / 10;
  }, [data]);
  const longest = useMemo(
    () =>
      data.reduce(
        (max, r) => (r.elapsed_months > max.elapsed_months ? r : max),
        data[0],
      ),
    [data],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
        現在はモックデータを表示しています。本番環境では在庫管理システムと連携します。
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription>要注意銘柄数（乖離 3ヶ月超）</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums text-red-700">
              {redCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            想定回転月数を 3ヶ月以上超過している銘柄
          </CardContent>
        </DashboardCard>
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription>平均在庫滞留月数</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums text-stone-700">
              {avgElapsed}ヶ月
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            全在庫銘柄の経過月数の単純平均
          </CardContent>
        </DashboardCard>
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription>最長滞留銘柄</CardDescription>
            <CardTitle className="truncate text-lg font-semibold text-stone-800">
              {longest ? longest.model : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {longest ? `${longest.elapsed_months}ヶ月（${longest.brand}）` : "—"}
          </CardContent>
        </DashboardCard>
      </div>

      <DashboardCard>
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-base">回転率アラート一覧</CardTitle>
          <CardDescription>想定回転月数と実経過月数の乖離を確認</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-md border border-stone-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-stone-50">
                <TableRow className="hover:bg-stone-50 [&>th]:text-stone-500 [&>th]:text-xs [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-wide">
                  <TableHead>ブランド</TableHead>
                  <TableHead>モデル / Ref.</TableHead>
                  <TableHead>仕入日</TableHead>
                  <TableHead className="text-right">経過（月）</TableHead>
                  <TableHead className="text-right">想定（月）</TableHead>
                  <TableHead className="text-right">乖離（月）</TableHead>
                  <TableHead className="text-center">アラート</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data
                  .sort((a, b) => b.deviation - a.deviation)
                  .map((row) => {
                    const cfg = alertConfig[row.alert_level];
                    const deviationSign = row.deviation > 0 ? "+" : "";
                    return (
                      <TableRow
                        key={`${row.ref_number}-${row.purchase_date}`}
                        className={`border-stone-100 transition-colors ${cfg.rowClass}`}
                      >
                        <TableCell className="font-medium text-stone-800 whitespace-nowrap">
                          {row.brand}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-stone-700 max-w-[220px] truncate">{row.model}</div>
                          <div className="font-mono text-xs text-stone-400">{row.ref_number}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-stone-500 whitespace-nowrap">
                          {row.purchase_date}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm font-medium text-stone-800">
                          {row.elapsed_months.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-stone-500">
                          {row.expected_months.toFixed(1)}
                        </TableCell>
                        <TableCell
                          className={`text-right tabular-nums text-sm font-semibold ${
                            row.deviation > 0 ? "text-red-700" : "text-emerald-600"
                          }`}
                        >
                          {deviationSign}{row.deviation.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${cfg.badgeClass}`}
                          >
                            {cfg.label}
                          </span>
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
