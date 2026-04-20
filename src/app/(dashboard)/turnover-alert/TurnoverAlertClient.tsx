"use client";

import { useMemo, useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { mockTurnoverAlertItems, type TurnoverAlertItem } from "@/lib/mockData";

type Urgency = "critical" | "warning" | "normal" | "excellent";

function getUrgency(deviation: number): Urgency {
  if (deviation >= 5) return "critical";
  if (deviation >= 2) return "warning";
  if (deviation >= -1) return "normal";
  return "excellent";
}

function UrgencyBadge({ deviation }: { deviation: number }) {
  const u = getUrgency(deviation);
  const map: Record<Urgency, { label: string; className: string; pulse?: boolean }> = {
    critical: { label: "緊急", className: "bg-red-100 text-red-800 border-red-200", pulse: true },
    warning: { label: "要注意", className: "bg-amber-100 text-amber-800 border-amber-200" },
    normal: { label: "正常", className: "bg-stone-100 text-stone-600 border-stone-200" },
    excellent: { label: "優秀", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  };
  const { label, className, pulse } = map[u];
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className} ${pulse ? "alert-pulse" : ""}`}
    >
      {label}
    </span>
  );
}

function recommendedAction(deviation: number): string {
  const u = getUrgency(deviation);
  if (u === "critical") return "値下げ検討";
  if (u === "warning") return "販促強化";
  if (u === "normal") return "現状維持";
  return "追加仕入れ検討";
}

function ElapsedBar({
  elapsed,
  expected,
  maxElapsed,
}: {
  elapsed: number;
  expected: number;
  maxElapsed: number;
}) {
  const denom = Math.max(maxElapsed, 0.01);
  const elapsedPct = Math.min((elapsed / denom) * 100, 100);
  const expectedPct = Math.min((expected / denom) * 100, 100);

  return (
    <div className="flex items-center justify-end gap-2">
      <span className="tabular-nums text-sm font-semibold text-stone-800">{elapsed.toFixed(1)}</span>
      <div className="relative h-2 w-[120px] shrink-0 rounded-full bg-stone-200">
        {elapsed <= expected ? (
          <div
            className="absolute left-0 top-0 h-2 rounded-full bg-emerald-400/80"
            style={{ width: `${elapsedPct}%` }}
          />
        ) : (
          <>
            <div
              className="absolute left-0 top-0 h-2 rounded-l-full bg-stone-400/90"
              style={{ width: `${expectedPct}%` }}
            />
            <div
              className="absolute top-0 h-2 bg-red-500"
              style={{
                left: `${expectedPct}%`,
                width: `${elapsedPct - expectedPct}%`,
                borderTopRightRadius: "4px",
                borderBottomRightRadius: "4px",
              }}
            />
          </>
        )}
        <div
          className="pointer-events-none absolute top-1/2 z-10 h-3 w-0.5 -translate-y-1/2 bg-stone-800"
          style={{ left: `clamp(0px, calc(${expectedPct}% - 1px), 118px)` }}
          title={`想定 ${expected.toFixed(1)}ヶ月`}
        />
      </div>
    </div>
  );
}

export function TurnoverAlertClient() {
  const data: TurnoverAlertItem[] = mockTurnoverAlertItems;
  const [showNormalRows, setShowNormalRows] = useState(false);

  const maxElapsed = useMemo(
    () => data.reduce((m, r) => Math.max(m, r.elapsed_months), 0),
    [data],
  );

  const criticalCount = useMemo(() => data.filter((r) => r.deviation >= 3).length, [data]);

  const longest = useMemo(
    () => data.reduce((max, r) => (r.elapsed_months > max.elapsed_months ? r : max), data[0]),
    [data],
  );

  const opportunityLoss = useMemo(() => {
    const stuck = data.filter((r) => r.deviation > 0);
    const sumPurchase = stuck.reduce((s, r) => s + r.purchase_price, 0);
    return Math.round(sumPurchase * 0.2 * 10) / 10;
  }, [data]);

  const sorted = useMemo(
    () => [...data].sort((a, b) => b.deviation - a.deviation),
    [data],
  );

  const visibleRows = useMemo(() => {
    if (showNormalRows) return sorted;
    return sorted.filter((r) => {
      const u = getUrgency(r.deviation);
      return u === "critical" || u === "warning";
    });
  }, [sorted, showNormalRows]);

  const hiddenCount = useMemo(
    () => sorted.filter((r) => {
      const u = getUrgency(r.deviation);
      return u === "normal" || u === "excellent";
    }).length,
    [sorted],
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <span className="rounded border border-stone-200 px-2 py-0.5 text-xs text-stone-400">
          モックデータ表示中
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription className="text-red-700">要注意銘柄数</CardDescription>
            <CardTitle className="text-5xl font-bold tabular-nums text-red-700">
              {criticalCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            想定回転期間を3ヶ月以上超過している銘柄（乖離 +3ヶ月以上）
          </CardContent>
        </DashboardCard>

        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription className="text-red-700">最長滞留</CardDescription>
            <CardTitle className="line-clamp-2 text-2xl font-bold leading-tight text-red-700 md:text-3xl">
              {longest ? longest.model : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-muted-foreground">
            {longest && (
              <p className="text-base font-bold tabular-nums text-red-700">
                {longest.elapsed_months.toFixed(1)}ヶ月（{longest.brand}）
              </p>
            )}
            <p className="font-medium text-red-800">即時対応が必要な可能性があります</p>
          </CardContent>
        </DashboardCard>

        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription>推定機会損失額</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums text-stone-800 md:text-4xl">
              約{opportunityLoss.toLocaleString()}万円
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            滞留銘柄の仕入価格合計 × 平均粗利率20% の仮計算。この金額が回転していれば得られた利益の目安です。
          </CardContent>
        </DashboardCard>
      </div>

      {sorted.some((r) => {
        const u = getUrgency(r.deviation);
        return u === "critical" || u === "warning";
      }) && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-bold text-red-900">即時対応が必要な銘柄</p>
          <ul className="mt-3 space-y-3">
            {sorted
              .filter((r) => {
                const u = getUrgency(r.deviation);
                return u === "critical" || u === "warning";
              })
              .map((row) => {
                const u = getUrgency(row.deviation);
                const sign = row.deviation > 0 ? "+" : "";
                return (
                  <li
                    key={`${row.ref_number}-${row.purchase_date}`}
                    className="border-l-2 border-red-500 pl-3 text-sm text-stone-800"
                  >
                    <span className="font-semibold">{row.brand}</span> {row.model} —{" "}
                    <span className="tabular-nums">{row.elapsed_months.toFixed(1)}ヶ月滞留</span>
                    （{sign}
                    {row.deviation.toFixed(1)}ヶ月超過）→「{recommendedAction(row.deviation)}」
                    {u === "critical" && (
                      <span className="ml-2 rounded bg-red-200 px-1.5 py-0.5 text-[10px] font-bold text-red-900">
                        緊急
                      </span>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      <DashboardCard>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base">回転率アラート一覧</CardTitle>
          <CardDescription>想定回転月数と実経過月数の乖離を確認</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="overflow-hidden rounded-md border border-stone-200">
            <Table>
              <TableHeader className="bg-stone-50">
                <TableRow className="hover:bg-stone-50 [&>th]:text-stone-500 [&>th]:text-xs [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-wide">
                  <TableHead>ブランド</TableHead>
                  <TableHead>モデル / Ref.</TableHead>
                  <TableHead>仕入日</TableHead>
                  <TableHead className="text-right">経過月数</TableHead>
                  <TableHead className="text-right">想定（月）</TableHead>
                  <TableHead className="text-right">乖離（月）</TableHead>
                  <TableHead className="text-center">緊急度</TableHead>
                  <TableHead className="text-center">推奨アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRows.map((row) => {
                  const u = getUrgency(row.deviation);
                  const deviationSign = row.deviation > 0 ? "+" : "";
                  return (
                    <TableRow
                      key={`${row.ref_number}-${row.purchase_date}`}
                      className={`group relative border-stone-100 transition-all duration-150 hover:bg-stone-50 ${
                        u === "critical"
                          ? "bg-red-50/40"
                          : u === "warning"
                            ? "bg-amber-50/30"
                            : ""
                      }`}
                    >
                      <TableCell className="border-l-[3px] border-l-transparent font-medium whitespace-nowrap text-stone-800 transition-colors duration-150 group-hover:border-l-[#8B0000]">
                        {row.brand}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[220px] truncate text-sm text-stone-700">{row.model}</div>
                        <div className="font-mono text-xs text-stone-400">{row.ref_number}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-stone-500 whitespace-nowrap">
                        {row.purchase_date}
                      </TableCell>
                      <TableCell className="text-right">
                        <ElapsedBar
                          elapsed={row.elapsed_months}
                          expected={row.expected_months}
                          maxElapsed={maxElapsed}
                        />
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm text-stone-500">
                        {row.expected_months.toFixed(1)}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums text-sm font-semibold ${
                          row.deviation > 0 ? "text-red-700" : "text-emerald-600"
                        }`}
                      >
                        {deviationSign}
                        {row.deviation.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center">
                        <UrgencyBadge deviation={row.deviation} />
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium text-stone-700">
                        {recommendedAction(row.deviation)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {hiddenCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => setShowNormalRows((v) => !v)}
            >
              {showNormalRows ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  正常銘柄を折りたたむ
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  正常銘柄を表示（{hiddenCount}件）
                </>
              )}
            </Button>
          )}
        </CardContent>
      </DashboardCard>
    </div>
  );
}
