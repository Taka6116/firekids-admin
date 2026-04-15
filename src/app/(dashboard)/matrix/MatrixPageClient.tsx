"use client";

import { MatrixScatterPlot } from "@/components/charts/MatrixScatterPlot";
import { DashboardCard } from "@/components/layout/DashboardCard";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMatrix } from "@/hooks/useMatrix";
import { useFilterStore } from "@/stores/filterStore";

export function MatrixPageClient() {
  const matrixChannelFilter = useFilterStore((s) => s.matrixChannelFilter);
  const setMatrixChannelFilter = useFilterStore((s) => s.setMatrixChannelFilter);

  const channelParam =
    matrixChannelFilter === "all" ? undefined : matrixChannelFilter;

  const { data, isPending, isError, error } = useMatrix({
    channel: channelParam,
  });

  return (
    <div className="space-y-6">
      <DashboardCard className="no-print">
        <CardHeader className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">仕入区分</CardTitle>
            <CardDescription>オークション / ディーラー / 個人買取で絞り込み</CardDescription>
          </div>
          <Tabs
            value={matrixChannelFilter}
            onValueChange={(v) =>
              setMatrixChannelFilter(
                v as "all" | "auction" | "dealer" | "individual",
              )
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
