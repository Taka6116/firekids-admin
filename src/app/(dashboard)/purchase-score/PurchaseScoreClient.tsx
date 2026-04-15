"use client";

import { useMemo } from "react";
import { toast } from "sonner";

import { DashboardCard } from "@/components/layout/DashboardCard";
import { PurchaseScoreTable } from "@/components/tables/PurchaseScoreTable";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePurchaseScore } from "@/hooks/usePurchaseScore";
import { downloadPurchaseScoreCsv } from "@/lib/exportPurchaseScoreCsv";
import { useFilterStore } from "@/stores/filterStore";
import type { PurchaseScoreItem } from "@/types/purchaseScore";

const ALL = "__all__";

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "ja"));
}

function vintageDemandIndex(rows: PurchaseScoreItem[]): number {
  if (rows.length === 0) {
    return 0;
  }
  const avg = rows.reduce((s, r) => s + r.score, 0) / rows.length;
  return Math.round(avg * 1.15);
}

export function PurchaseScoreClient() {
  const purchaseBrand = useFilterStore((s) => s.purchaseBrand);
  const purchaseChannel = useFilterStore((s) => s.purchaseChannel);
  const purchasePriceBand = useFilterStore((s) => s.purchasePriceBand);
  const setPurchaseBrand = useFilterStore((s) => s.setPurchaseBrand);
  const setPurchaseChannel = useFilterStore((s) => s.setPurchaseChannel);
  const setPurchasePriceBand = useFilterStore((s) => s.setPurchasePriceBand);

  const filters = useMemo(
    () => ({
      brand: purchaseBrand,
      channel: purchaseChannel,
      price_band: purchasePriceBand,
    }),
    [purchaseBrand, purchaseChannel, purchasePriceBand],
  );

  const { data: allRows = [] } = usePurchaseScore({});
  const { data: rawData, isPending, isError, error } = usePurchaseScore(filters);

  const data = useMemo(() => rawData ?? [], [rawData]);

  const brandOptions = useMemo(
    () => uniqueSorted(allRows.map((r) => r.brand)),
    [allRows],
  );
  const bandOptions = useMemo(
    () => uniqueSorted(allRows.map((r) => r.price_band)),
    [allRows],
  );

  const priorityCount = useMemo(
    () => data.filter((r) => r.score >= 80).length,
    [data],
  );
  const reviewCount = useMemo(
    () => data.filter((r) => r.score < 50 || r.action === "hold").length,
    [data],
  );
  const demandIndex = useMemo(() => vintageDemandIndex(data), [data]);

  function handleExportCsv() {
    if (data.length === 0) {
      toast.error("エクスポートするデータがありません");
      return;
    }
    downloadPurchaseScoreCsv(data);
    toast.success("CSV をダウンロードしました");
  }

  if (isError) {
    return (
      <p className="text-destructive" role="alert">
        {error instanceof Error ? error.message : "データ取得に失敗しました"}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription>ヴィンテージ時計需要インデックス</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {isPending ? "—" : demandIndex}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            モック集計（スコア平均から算出したダミー指標）
          </CardContent>
        </DashboardCard>
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription>優先件数（スコア 80 以上）</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums text-[#8B0000]">
              {isPending ? "—" : priorityCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            画面上のフィルター適用後の件数
          </CardContent>
        </DashboardCard>
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardDescription>要確認件数（スコア 50 未満または保留）</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums text-amber-700">
              {isPending ? "—" : reviewCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            仕入判断の再確認候補
          </CardContent>
        </DashboardCard>
      </div>

      <DashboardCard>
        <CardHeader className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-base">フィルター</CardTitle>
            <CardDescription>ブランド / 価格帯 / 仕入区分</CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              value={purchaseBrand ?? ALL}
              onValueChange={(v) => {
                if (v == null || v === ALL) {
                  setPurchaseBrand(undefined);
                  return;
                }
                setPurchaseBrand(v);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="ブランド" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>全ブランド</SelectItem>
                {brandOptions.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={purchasePriceBand ?? ALL}
              onValueChange={(v) => {
                if (v == null || v === ALL) {
                  setPurchasePriceBand(undefined);
                  return;
                }
                setPurchasePriceBand(v);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="価格帯" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>全価格帯</SelectItem>
                {bandOptions.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={purchaseChannel ?? ALL}
              onValueChange={(v) => {
                if (v == null || v === ALL) {
                  setPurchaseChannel(undefined);
                  return;
                }
                setPurchaseChannel(v as PurchaseScoreItem["channel"]);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="仕入区分" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>全区分</SelectItem>
                <SelectItem value="auction">オークション</SelectItem>
                <SelectItem value="dealer">ディーラー</SelectItem>
                <SelectItem value="individual">個人買取</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" size="sm" onClick={handleExportCsv}>
              CSVエクスポート
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <PurchaseScoreTable data={data} />
          )}
        </CardContent>
      </DashboardCard>
    </div>
  );
}
