"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

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
    {
      name: c.individual.name,
      現在: c.individual.current_ratio,
      推奨: c.individual.suggested_ratio,
    },
  ];
}

export function BudgetSimulatorClient() {
  const { data, isPending, isError, error } = useBudget();
  const [ratios, setRatios] = useState<number[]>(() =>
    mockBrandAllocationDefaults.map((b) => b.ratioPercent),
  );
  const [simulatedAt, setSimulatedAt] = useState<string | null>(null);

  const chartData = useMemo(() => (data ? channelChartData(data) : []), [data]);

  function handleRatioChange(index: number, raw: number) {
    setRatios((prev) => {
      const next = [...prev];
      next[index] = raw;
      return normalizeTo100(next);
    });
  }

  function handleRunSimulation() {
    toast.success("シミュレーションを実行しました（モック）");
    setSimulatedAt(
      new Date().toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
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

  const totalPct = ratios.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            対象月 <span className="text-foreground">{data.month}</span>
          </p>
          {simulatedAt ? (
            <p className="text-xs text-muted-foreground">最終実行: {simulatedAt}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className="text-xs text-muted-foreground">総予算</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {formatYen(data.total_budget)}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-[#8B0000] text-white hover:bg-[#6d0000]"
              onClick={handleRunSimulation}
            >
              RUN SIMULATION
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handlePrintPdf}>
              SAVE EXPORT [PDF]
            </Button>
          </div>
        </div>
      </div>

      <div className="no-print">
        <DashboardCard>
          <CardHeader>
            <CardTitle className="text-base">チャネル別配分（現在 vs 推奨）</CardTitle>
            <CardDescription>
              Recharts による棒グラフ（モックの suggested_ratio を反映）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetAllocationChart data={chartData} />
          </CardContent>
        </DashboardCard>
      </div>

      <div className="no-print">
        <DashboardCard>
          <CardHeader>
            <CardTitle className="text-base">Manual Adjustment</CardTitle>
            <CardDescription>
              ブランド別の配分（%）。スライダー変更後は自動で合計 100% に再配分されます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {mockBrandAllocationDefaults.map((row, index) => (
              <div key={row.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{row.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {ratios[index]!.toFixed(1)}% — 推奨額{" "}
                    <span className="text-foreground">
                      {formatYen((data.total_budget * ratios[index]!) / 100)}
                    </span>
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={0.5}
                  value={ratios[index]!}
                  onValueChange={(v) => {
                    const next =
                      typeof v === "number" ? v : Array.isArray(v) ? v[0]! : 0;
                    handleRatioChange(index, next);
                  }}
                />
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">配分合計</span>
              <span
                className={
                  Math.abs(totalPct - 100) < 0.05
                    ? "font-medium text-emerald-700"
                    : "font-medium text-amber-700"
                }
              >
                {totalPct.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </DashboardCard>
      </div>

      <div className="print-only rounded-lg border border-stone-300 bg-white p-8 text-stone-900 shadow-none">
        <h1 className="font-display text-2xl font-semibold text-stone-900">
          月次予算配分レポート（印刷用）
        </h1>
        <p className="mt-2 text-sm text-stone-600">対象月: {data.month}</p>
        <p className="mt-1 text-sm text-stone-600">
          総予算: {formatYen(data.total_budget)}
        </p>
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
                <td className="py-2 tabular-nums">
                  {formatYen((data.total_budget * ratios[index]!) / 100)}
                </td>
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
        <p className="mt-10 text-xs text-stone-500">
          本書は社内向けモック出力です。正式数値はバックエンド連携後にご確認ください。
        </p>
      </div>
    </div>
  );
}
