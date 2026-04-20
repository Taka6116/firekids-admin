"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
const OTHER = "__other__";

const KNOWN_BRANDS = [
  "ロレックス", "パテック・フィリップ", "オーデマ・ピゲ", "オメガ",
  "カルティエ", "IWC", "ジャガールクルト", "ブレゲ", "ブライトリング",
  "タグホイヤー", "ヴァシュロン", "グランドセイコー", "セイコー",
  "シチズン", "チューダー", "ロンジン", "ハミルトン", "パネライ",
  "フランクミュラー", "ROLEX", "OMEGA", "CARTIER", "TUDOR", "SEIKO",
];
const KNOWN_BRANDS_SET = new Set(KNOWN_BRANDS);

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "ja"));
}

function vintageDemandIndex(rows: PurchaseScoreItem[]): number {
  if (rows.length === 0) return 0;
  const avg = rows.reduce((s, r) => s + r.score, 0) / rows.length;
  return Math.round(avg * 1.15);
}

function useCountUp(target: number, duration = 900): number {
  const [count, setCount] = useState(0);
  const prevTarget = useRef<number>(target);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    prevTarget.current = target;
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return count;
}

function SummaryCard({
  label,
  value,
  sub,
  valueClass = "",
}: {
  label: string;
  value: number;
  sub: string;
  valueClass?: string;
}) {
  const animated = useCountUp(value);
  return (
    <DashboardCard>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className={`text-3xl font-semibold tabular-nums ${valueClass}`}>
          {animated}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">{sub}</CardContent>
    </DashboardCard>
  );
}

export function PurchaseScoreClient() {
  const purchaseChannel = useFilterStore((s) => s.purchaseChannel);
  const purchasePriceBand = useFilterStore((s) => s.purchasePriceBand);
  const setPurchaseChannel = useFilterStore((s) => s.setPurchaseChannel);
  const setPurchasePriceBand = useFilterStore((s) => s.setPurchasePriceBand);

  const [activeBrand, setActiveBrand] = useState<string>(ALL);

  const { data: allRows = [], isPending, isError, error } = usePurchaseScore({});

  // ブランド別商品数を集計
  const brandCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of allRows) {
      map.set(row.brand, (map.get(row.brand) ?? 0) + 1);
    }
    return map;
  }, [allRows]);

  // KNOWN_BRANDSに含まれるブランドを商品数順でTop8まで取得
  const topBrands = useMemo(() => {
    return KNOWN_BRANDS
      .filter((b) => brandCountMap.has(b))
      .sort((a, b) => (brandCountMap.get(b) ?? 0) - (brandCountMap.get(a) ?? 0))
      .slice(0, 8);
  }, [brandCountMap]);

  // 「その他」に含まれるブランドが存在するか
  const hasOther = useMemo(() => {
    return allRows.some((r) => !KNOWN_BRANDS_SET.has(r.brand));
  }, [allRows]);

  const activeBrandValue = activeBrand === ALL ? undefined : activeBrand;

  const data = useMemo(() => {
    return allRows.filter((row) => {
      if (activeBrand === OTHER) {
        if (KNOWN_BRANDS_SET.has(row.brand)) return false;
      } else if (activeBrandValue && row.brand !== activeBrandValue) {
        return false;
      }
      if (purchaseChannel && row.channel !== purchaseChannel) return false;
      if (purchasePriceBand && row.price_band !== purchasePriceBand) return false;
      return true;
    });
  }, [allRows, activeBrand, activeBrandValue, purchaseChannel, purchasePriceBand]);

  const bandOptions = useMemo(
    () => uniqueSorted(allRows.map((r) => r.price_band)),
    [allRows],
  );

  const priorityCount = useMemo(() => data.filter((r) => r.score >= 80).length, [data]);
  const reviewCount = useMemo(() => data.filter((r) => r.score < 50 || r.action === "hold").length, [data]);
  const demandIndex = useMemo(() => vintageDemandIndex(data), [data]);

  function handleExportCsv() {
    if (data.length === 0) { toast.error("エクスポートするデータがありません"); return; }
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

  const tabs = [
    { value: ALL, label: "全ブランド", count: allRows.length },
    ...topBrands.map((b) => ({ value: b, label: b, count: brandCountMap.get(b) ?? 0 })),
    ...(hasOther
      ? [{ value: OTHER, label: "その他", count: allRows.filter((r) => !KNOWN_BRANDS_SET.has(r.brand)).length }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="ヴィンテージ時計需要インデックス"
          value={isPending ? 0 : demandIndex}
          sub="モック集計（スコア平均から算出したダミー指標）"
        />
        <SummaryCard
          label="優先件数（スコア 80 以上）"
          value={isPending ? 0 : priorityCount}
          sub="画面上のフィルター適用後の件数"
          valueClass="text-[#8B0000]"
        />
        <SummaryCard
          label="要確認件数（スコア 50 未満または保留）"
          value={isPending ? 0 : reviewCount}
          sub="仕入判断の再確認候補"
          valueClass="text-amber-700"
        />
      </div>

      {/* ブランドタブ */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = activeBrand === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveBrand(tab.value)}
              className={
                isActive
                  ? "inline-flex items-center gap-1.5 rounded-full bg-[#8B0000] px-4 py-1.5 text-sm font-semibold text-white transition-colors duration-150"
                  : "inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm text-stone-600 transition-colors duration-150 hover:bg-red-50 hover:border-red-200 hover:text-red-800"
              }
            >
              {tab.label}
              <span
                className={
                  isActive
                    ? "rounded-full bg-white/25 px-1.5 py-0.5 text-[11px] font-bold leading-none tabular-nums text-white"
                    : "rounded-full bg-stone-100 px-1.5 py-0.5 text-[11px] font-bold leading-none tabular-nums text-stone-500"
                }
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <DashboardCard>
        <CardHeader className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-base">フィルター</CardTitle>
            <CardDescription>価格帯 / 仕入区分</CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              value={purchasePriceBand ?? ALL}
              onValueChange={(v) => setPurchasePriceBand(v === ALL ? undefined : v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="価格帯" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>全価格帯</SelectItem>
                {bandOptions.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={purchaseChannel ?? ALL}
              onValueChange={(v) => {
                if (v === ALL) { setPurchaseChannel(undefined); return; }
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
