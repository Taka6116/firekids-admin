"use client";

import { MatrixScatterPlot } from "@/components/charts/MatrixScatterPlot";
import { DashboardCard } from "@/components/layout/DashboardCard";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMatrix } from "@/hooks/useMatrix";
import { matrixMedians, getMatrixZone, turnoverSpeedScore } from "@/lib/matrixPlot";
import { useFilterStore } from "@/stores/filterStore";
import { useMemo } from "react";

const ZONE_SUMMARIES = [
  { key: "star" as const, label: "スター", color: "text-emerald-700", bg: "bg-emerald-50" },
  { key: "golden_tree" as const, label: "金のなる木", color: "text-yellow-700", bg: "bg-yellow-50" },
  { key: "problem_child" as const, label: "問題児", color: "text-orange-700", bg: "bg-orange-50" },
  { key: "underdog" as const, label: "負け犬", color: "text-slate-600", bg: "bg-slate-50" },
];

export function MatrixPageClient() {
  const matrixChannelFilter = useFilterStore((s) => s.matrixChannelFilter);
  const setMatrixChannelFilter = useFilterStore((s) => s.setMatrixChannelFilter);

  const channelParam =
    matrixChannelFilter === "all" ? undefined : matrixChannelFilter;

  const { data, isPending, isError, error } = useMatrix({ channel: channelParam });

  const zoneCounts = useMemo(() => {
    if (!data || data.length === 0) return { star: 0, golden_tree: 0, problem_child: 0, underdog: 0 };
    const mids = matrixMedians(data);
    const counts = { star: 0, golden_tree: 0, problem_child: 0, underdog: 0 };
    for (const row of data) {
      const speed = turnoverSpeedScore(row.x_turnover);
      const zone = getMatrixZone(speed, row.y_gross_margin, mids.midSpeed, mids.midMargin);
      counts[zone]++;
    }
    return counts;
  }, [data]);

  return (
    <div className="space-y-6">
      {/* 目的の説明テキスト */}
      <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 text-sm leading-relaxed text-stone-700 shadow-sm">
        <p className="mb-2 font-semibold text-stone-900">このマトリクスの見方</p>
        <p className="mb-3 text-stone-500">
          「どの商品を優先して仕入れるべきか」を回転スピードと粗利率の2軸で視覚化しています。
        </p>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-700">右上</span>
            <span><strong>スター</strong> ─ 回転が速く利益率も高い → 積極的に仕入れるべき商品</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-bold text-yellow-700">左上</span>
            <span><strong>金のなる木</strong> ─ 利益率は高いが回転が遅い → 高単価商品として厳選仕入れ</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 rounded bg-orange-100 px-1.5 py-0.5 text-xs font-bold text-orange-700">右下</span>
            <span><strong>問題児</strong> ─ 回転は速いが利益率が低い → 仕入れ価格の見直しが必要</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-bold text-slate-600">左下</span>
            <span><strong>負け犬</strong> ─ 回転も利益率も低い → 仕入れ停止を検討</span>
          </li>
        </ul>
      </div>

      {/* 象限サマリーカード */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ZONE_SUMMARIES.map((z) => (
          <DashboardCard key={z.key}>
            <CardHeader className="pb-1 pt-4">
              <CardDescription className="text-xs">{z.label}</CardDescription>
              <CardTitle className={`text-2xl font-bold tabular-nums ${z.color}`}>
                {isPending ? "—" : zoneCounts[z.key]}
                <span className="ml-1 text-sm font-normal text-stone-400">件</span>
              </CardTitle>
            </CardHeader>
          </DashboardCard>
        ))}
      </div>

      {/* チャンネルフィルター */}
      <DashboardCard className="no-print">
        <CardHeader className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">仕入区分</CardTitle>
            <CardDescription>オークション / ディーラー / 個人買取で絞り込み</CardDescription>
          </div>
          <Tabs
            value={matrixChannelFilter}
            onValueChange={(v) =>
              setMatrixChannelFilter(v as "all" | "auction" | "dealer" | "individual")
            }
          >
            <TabsList variant="line" className="w-full sm:w-auto">
              <TabsTrigger value="all">すべて</TabsTrigger>
              <TabsTrigger value="auction">オークション</TabsTrigger>
              <TabsTrigger value="dealer">ディーラー</TabsTrigger>
              <TabsTrigger value="individual">個人買取</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
      </DashboardCard>

      {isError ? (
        <p className="text-destructive" role="alert">
          {error instanceof Error ? error.message : "データ取得に失敗しました"}
        </p>
      ) : isPending ? (
        <Skeleton className="h-[520px] w-full" />
      ) : (
        <MatrixScatterPlot items={data ?? []} />
      )}
    </div>
  );
}
