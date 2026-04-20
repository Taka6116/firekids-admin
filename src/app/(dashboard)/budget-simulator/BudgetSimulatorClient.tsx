"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  BudgetAllocationChart,
  type ChannelBarRow,
} from "@/components/charts/BudgetAllocationChart";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/layout/DashboardCard";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useBudget } from "@/hooks/useBudget";
import { mockBrandAllocationDefaults } from "@/lib/mockData";
import type { BudgetSimulation } from "@/types/budget";

// ──────────────────────────────────────────────
// ユーティリティ
// ──────────────────────────────────────────────
function normalizeTo100(values: number[]): number[] {
  const sum = values.reduce((a, b) => a + b, 0) || 1;
  return values.map((v) => (v / sum) * 100);
}

function formatYen(n: number): string {
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

function channelChartData(sim: BudgetSimulation): ChannelBarRow[] {
  const c = sim.channels;
  return [
    { name: c.auction.name, 現在: c.auction.current_ratio, 推奨: c.auction.suggested_ratio },
    { name: c.dealer.name, 現在: c.dealer.current_ratio, 推奨: c.dealer.suggested_ratio },
    { name: c.individual.name, 現在: c.individual.current_ratio, 推奨: c.individual.suggested_ratio },
  ];
}

// ──────────────────────────────────────────────
// プログレスバー（ページロード時にアニメーション）
// ──────────────────────────────────────────────
function AnimatedProgressBar({ value, colorClass }: { value: number; colorClass: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.min(value, 100)), 100);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-stone-100">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

// ──────────────────────────────────────────────
// 差分バッジ
// ──────────────────────────────────────────────
function DiffBadge({ diff, budget }: { diff: number; budget: number }) {
  const absYen = Math.abs((diff / 100) * budget);
  if (Math.abs(diff) <= 5) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
        ✓ 適正
      </span>
    );
  }
  if (diff < 0) {
    // 現在 < 推奨 → 不足
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
        ↑ {formatYen(absYen)} 不足
      </span>
    );
  }
  // 現在 > 推奨 → 超過
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
      ↓ {formatYen(absYen)} 超過
    </span>
  );
}

// ──────────────────────────────────────────────
// メインコンポーネント
// ──────────────────────────────────────────────
// スライダー対象は上位4ブランド（インデックス0-3）、インデックス4は「その他」
const TOP_SLIDER_COUNT = 4;

export function BudgetSimulatorClient() {
  const { data, isPending, isError, error } = useBudget();
  const [ratios, setRatios] = useState<number[]>(() =>
    mockBrandAllocationDefaults.map((b) => b.ratioPercent),
  );
  const [simulatedAt, setSimulatedAt] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<number | null>(null);
  const [simRunning, setSimRunning] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // 直前の ratio を保持（前回比計算用）
  const prevRatiosRef = useRef<number[]>(ratios);
  const [prevRatios, setPrevRatios] = useState<number[]>(ratios);

  const chartData = useMemo(() => (data ? channelChartData(data) : []), [data]);

  function handleRatioChange(index: number, raw: number) {
    setPrevRatios(ratios);
    prevRatiosRef.current = ratios;
    setRatios((prev) => {
      const next = [...prev];
      next[index] = raw;
      return normalizeTo100(next);
    });
  }

  function handleRunSimulation() {
    setSimRunning(true);
    setTimeout(() => {
      setSimRunning(false);
      // 推奨比率との一致度から予測改善率を仮計算
      let improvementScore = 0;
      if (data) {
        const channels = [data.channels.auction, data.channels.dealer, data.channels.individual];
        const totalDiff = channels.reduce((acc, ch) => acc + Math.abs(ch.current_ratio - ch.suggested_ratio), 0);
        // 差分が小さいほど高スコア（最大10%）
        improvementScore = Math.max(0, Math.round((1 - totalDiff / 100) * 10));
      }
      setSimResult(improvementScore);
      setSimulatedAt(
        new Date().toLocaleString("ja-JP", {
          year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit",
        }),
      );
      toast.success("シミュレーションを実行しました");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }, 400);
  }

  function handlePrintPdf() {
    window.print();
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-[320px] w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-destructive" role="alert">
        {error instanceof Error ? error.message : "データ取得に失敗しました"}
      </p>
    );
  }

  // ── 予算ヘルスカード用の計算 ──
  const totalBudget = data.total_budget;
  const spentTotal = Object.values(data.channels).reduce((s, ch) => s + ch.current_amount, 0);
  const consumptionRate = Math.round((spentTotal / totalBudget) * 100);
  const remaining = totalBudget - spentTotal;

  const progressColorClass =
    consumptionRate >= 90 ? "bg-red-600" :
    consumptionRate >= 70 ? "bg-amber-500" :
    "bg-emerald-500";

  // 最も効率的（推奨との差が小さい）チャネル
  const channelEntries = [
    { key: "auction", ch: data.channels.auction },
    { key: "dealer",  ch: data.channels.dealer },
    { key: "individual", ch: data.channels.individual },
  ];
  const mostEfficient = channelEntries.reduce((best, cur) =>
    Math.abs(cur.ch.current_ratio - cur.ch.suggested_ratio) <
    Math.abs(best.ch.current_ratio - best.ch.suggested_ratio) ? cur : best,
  );
  const leastEfficient = channelEntries.reduce((worst, cur) =>
    Math.abs(cur.ch.current_ratio - cur.ch.suggested_ratio) >
    Math.abs(worst.ch.current_ratio - worst.ch.suggested_ratio) ? cur : worst,
  );
  const leGap = leastEfficient.ch.current_ratio - leastEfficient.ch.suggested_ratio;
  const leYen = Math.abs((leGap / 100) * totalBudget);

  const totalPct = ratios.reduce((a, b) => a + b, 0);
  const othersRatio = ratios[TOP_SLIDER_COUNT] ?? 0;

  return (
    <div className="space-y-6">

      {/* ──────────── セクション1: 予算ヘルスカード ──────────── */}
      <div className="grid gap-6 md:grid-cols-3">

        {/* カード①：予算消化率 */}
        <DashboardCard>
          <CardHeader className="pb-1">
            <CardDescription>予算消化率</CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums">
              {consumptionRate}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <AnimatedProgressBar value={consumptionRate} colorClass={progressColorClass} />
            <p className="mt-2 text-xs text-muted-foreground">
              今月の消化率 {consumptionRate}%（残り {formatYen(remaining)}）
            </p>
          </CardContent>
        </DashboardCard>

        {/* カード②：最も効率的なチャネル */}
        <DashboardCard>
          <CardHeader className="pb-1">
            <CardDescription>最も効率的なチャネル</CardDescription>
            <CardTitle className="text-xl font-semibold text-emerald-700">
              {mostEfficient.ch.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              目標比率（{mostEfficient.ch.suggested_ratio}%）に最も近い運用ができています
            </p>
          </CardContent>
        </DashboardCard>

        {/* カード③：要対応アクション */}
        <DashboardCard>
          <CardHeader className="pb-1">
            <CardDescription>要対応アクション</CardDescription>
            <CardTitle className="text-xl font-semibold text-red-700">
              {leastEfficient.ch.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {leGap < 0 ? (
              <p className="text-xs font-medium text-red-700">
                {leastEfficient.ch.name} に {formatYen(leYen)} 不足しています（推奨比率との差: {Math.abs(leGap).toFixed(1)}%）
              </p>
            ) : (
              <p className="text-xs font-medium text-amber-700">
                {leastEfficient.ch.name} が推奨より {formatYen(leYen)} 超過しています（差: {leGap.toFixed(1)}%）
              </p>
            )}
          </CardContent>
        </DashboardCard>

      </div>

      {/* 対象月 / 実行ボタン */}
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            対象月 <span className="font-medium text-foreground">{data.month}</span>
            <span className="ml-3 text-foreground">総予算 <span className="font-semibold">{formatYen(totalBudget)}</span></span>
          </p>
          {simulatedAt && (
            <p className="text-xs text-muted-foreground">最終実行: {simulatedAt}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            className="min-w-[10rem] bg-[#8B0000] text-white hover:bg-[#6d0000]"
            onClick={handleRunSimulation}
            disabled={simRunning}
          >
            {simRunning ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 計算中…
              </span>
            ) : (
              "RUN SIMULATION"
            )}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handlePrintPdf}>
            保存 / PDF出力
          </Button>
        </div>
      </div>

      {/* ──────────── セクション2: チャネル差分ビジュアル ──────────── */}
      <div className="no-print">
        <DashboardCard>
          <CardHeader>
            <CardTitle className="text-xl">チャネル別配分（現在 vs 推奨）</CardTitle>
            <CardDescription>各チャネルの現在比率と推奨比率の比較</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <BudgetAllocationChart data={chartData} />

            {/* 差分サマリーテーブル */}
            <div className="overflow-x-auto rounded-md border border-stone-200">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-4 py-2 text-left">チャネル</th>
                    <th className="px-4 py-2 text-right">現在</th>
                    <th className="px-4 py-2 text-right">推奨</th>
                    <th className="px-4 py-2 text-right">差分</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {channelEntries.map(({ ch }) => {
                    const diff = ch.current_ratio - ch.suggested_ratio;
                    return (
                      <tr key={ch.name} className="hover:bg-stone-50 transition-colors duration-150">
                        <td className="px-4 py-3 font-medium text-stone-800">{ch.name}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{ch.current_ratio.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{ch.suggested_ratio.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right">
                          <DiffBadge diff={diff} budget={totalBudget} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </DashboardCard>
      </div>

      {/* ──────────── セクション3: 予算配分シミュレーター ──────────── */}
      <div className="no-print">
        <DashboardCard>
          <CardHeader>
            <CardTitle className="text-xl">予算配分シミュレーター</CardTitle>
            <CardDescription>
              スライダーを動かして最適な配分を試してみましょう。合計は自動的に100%に調整されます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {mockBrandAllocationDefaults.slice(0, TOP_SLIDER_COUNT).map((row, index) => {
              const prevRatio = prevRatios[index] ?? ratios[index] ?? 0;
              const currentRatio = ratios[index] ?? 0;
              const delta = currentRatio - prevRatio;
              return (
                <div key={row.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-2 text-sm">
                    <span className="font-medium text-stone-800">{row.name}</span>
                    <div className="text-right">
                      <span className="tabular-nums text-stone-700">
                        {currentRatio.toFixed(1)}%
                      </span>
                      <span className="mx-2 text-stone-300">|</span>
                      <span className="text-muted-foreground">
                        推奨 <span className="font-medium text-foreground">{formatYen((totalBudget * currentRatio) / 100)}</span>
                      </span>
                      {Math.abs(delta) >= 0.1 && (
                        <span className={`ml-2 text-xs font-semibold ${delta > 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={0.5}
                    value={currentRatio}
                    onValueChange={(v) => {
                      const next = typeof v === "number" ? v : Array.isArray(v) ? v[0]! : 0;
                      handleRatioChange(index, next);
                    }}
                  />
                </div>
              );
            })}

            {/* その他ブランド（スライダーなし） */}
            {mockBrandAllocationDefaults[TOP_SLIDER_COUNT] && (
              <div className="flex items-center justify-between rounded-md bg-stone-50 px-4 py-3 text-sm text-stone-600">
                <span className="font-medium">その他ブランド（自動調整）</span>
                <span className="tabular-nums">
                  {othersRatio.toFixed(1)}%
                  <span className="ml-2 text-muted-foreground">
                    {formatYen((totalBudget * othersRatio) / 100)}
                  </span>
                </span>
              </div>
            )}

            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">配分合計</span>
              <span className={Math.abs(totalPct - 100) < 0.05 ? "font-medium text-emerald-700" : "font-medium text-amber-700"}>
                {totalPct.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </DashboardCard>
      </div>

      {/* ──────────── セクション4: シミュレーション結果 ──────────── */}
      {simResult !== null && (
        <div ref={resultRef} className="no-print">
          <DashboardCard>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-xl text-[#8B0000]">シミュレーション結果</CardTitle>
              <CardDescription>{simulatedAt} 実行</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="rounded-xl bg-emerald-50 px-5 py-4">
                <p className="text-sm font-medium text-emerald-800">
                  この配分で進めた場合、過去データから推計すると売上効率が約
                  <span className="mx-1 text-2xl font-bold tabular-nums">{simResult}</span>
                  % 改善する見込みです
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  ※ 推奨比率との一致度をもとにした概算です。実際の結果は市場環境により異なります。
                </p>
              </div>

              {/* チャネル別乖離サマリー再掲 */}
              <div className="grid gap-3 sm:grid-cols-3">
                {channelEntries.map(({ ch }) => {
                  const diff = ch.current_ratio - ch.suggested_ratio;
                  return (
                    <div key={ch.name} className="rounded-lg border border-stone-200 px-4 py-3">
                      <p className="text-xs text-muted-foreground">{ch.name}</p>
                      <p className="mt-0.5 text-base font-semibold tabular-nums text-stone-800">
                        {ch.current_ratio.toFixed(1)}%
                        <span className="ml-1 text-xs font-normal text-muted-foreground">/ 推奨 {ch.suggested_ratio}%</span>
                      </p>
                      <DiffBadge diff={diff} budget={totalBudget} />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <Button type="button" size="sm" variant="outline" onClick={handlePrintPdf}>
                  保存 / PDF出力
                </Button>
              </div>
            </CardContent>
          </DashboardCard>
        </div>
      )}

      {/* ──────────── 印刷専用 ──────────── */}
      <div className="print-only rounded-lg border border-stone-300 bg-white p-8 text-stone-900 shadow-none">
        <h1 className="font-display text-2xl font-semibold text-stone-900">
          月次予算配分レポート（印刷用）
        </h1>
        <p className="mt-2 text-sm text-stone-600">対象月: {data.month}</p>
        <p className="mt-1 text-sm text-stone-600">総予算: {formatYen(totalBudget)}</p>
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-stone-500">
          ブランド配分（手動調整後）
        </h2>
        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-300 text-left">
              <th className="py-2 pr-4">ブランド</th>
              <th className="py-2 pr-4">割合</th>
              <th className="py-2">金額</th>
            </tr>
          </thead>
          <tbody>
            {mockBrandAllocationDefaults.map((row, index) => (
              <tr key={row.id} className="border-b border-stone-200">
                <td className="py-2 pr-4">{row.name}</td>
                <td className="py-2 pr-4 tabular-nums">{ratios[index]!.toFixed(1)}%</td>
                <td className="py-2 tabular-nums">{formatYen((totalBudget * ratios[index]!) / 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-stone-500">
          チャネル別（参考）
        </h2>
        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-300 text-left">
              <th className="py-2 pr-4">チャネル</th>
              <th className="py-2 pr-4">現在比率</th>
              <th className="py-2">推奨比率</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((r) => (
              <tr key={r.name} className="border-b border-stone-200">
                <td className="py-2 pr-4">{r.name}</td>
                <td className="py-2 pr-4 tabular-nums">{r.現在}%</td>
                <td className="py-2 tabular-nums">{r.推奨}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {simResult !== null && (
          <p className="mt-6 text-sm font-medium text-stone-700">
            シミュレーション結果: 売上効率 約 {simResult}% 改善見込み（{simulatedAt}）
          </p>
        )}
        <p className="mt-10 text-xs text-stone-500">
          本書は社内向けモック出力です。正式数値はバックエンド連携後にご確認ください。
        </p>
      </div>

    </div>
  );
}
