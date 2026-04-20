"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { mockMarketWatchItems, type MarketWatchItem } from "@/lib/mockData";

// ──────────────────────────────────────────────
// 定数
// ──────────────────────────────────────────────
const BRAND_JA: Record<string, string> = {
  "ROLEX": "ロレックス",
  "PATEK PHILIPPE": "パテック・フィリップ",
  "AUDEMARS PIGUET": "オーデマ・ピゲ",
  "CARTIER": "カルティエ",
  "OMEGA": "オメガ",
  "IWC": "IWC",
  "TUDOR": "チューダー",
  "SEIKO": "セイコー",
};

const MOCK_UPDATED_AT = "2026-04-20 12:00";

// ──────────────────────────────────────────────
// 仕入れ判断ロジック
// ──────────────────────────────────────────────
type JudgmentLevel = "buy" | "watch" | "rising" | "spike";

function getJudgment(rate: number): JudgmentLevel {
  if (rate <= -2) return "buy";
  if (rate < 2) return "watch";
  if (rate < 5) return "rising";
  return "spike";
}

function JudgmentBadge({ rate }: { rate: number }) {
  const level = getJudgment(rate);
  const map: Record<JudgmentLevel, { label: string; className: string }> = {
    buy:     { label: "仕入れ好機", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    watch:   { label: "様子見",     className: "bg-stone-100 text-stone-600 border-stone-200" },
    rising:  { label: "上昇中",     className: "bg-amber-50 text-amber-700 border-amber-200" },
    spike:   { label: "高値注意",   className: "bg-red-50 text-red-700 border-red-200" },
  };
  const { label, className } = map[level];
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

// ──────────────────────────────────────────────
// 変動率 + ミニバーチャート
// ──────────────────────────────────────────────
function RateCell({ rate }: { rate: number }) {
  const color = rate > 0 ? "text-emerald-600" : rate < 0 ? "text-red-700" : "text-stone-500";
  const sign = rate > 0 ? "+" : "";
  // ±10%を100%として正規化、最大50pxの幅
  const maxPct = 10;
  const barWidth = Math.min(Math.abs(rate) / maxPct, 1) * 50;

  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`tabular-nums text-sm font-semibold ${color}`}>
        {sign}{rate}%
      </span>
      <div className="flex h-1.5 w-[52px] items-center">
        {rate >= 0 ? (
          // プラス: 左から右へ緑バー
          <>
            <div className="w-[26px]" />
            <div className="rounded-r-full bg-emerald-400" style={{ width: `${barWidth / 2}px`, height: "6px" }} />
          </>
        ) : (
          // マイナス: 右から左へ赤バー
          <>
            <div className="flex-1" />
            <div className="rounded-l-full bg-red-400" style={{ width: `${barWidth / 2}px`, height: "6px" }} />
            <div className="w-[26px]" />
          </>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// サマリーカード
// ──────────────────────────────────────────────
function SummaryCards({
  data,
  onHighlightBuy,
  onHighlightSell,
}: {
  data: MarketWatchItem[];
  onHighlightBuy: () => void;
  onHighlightSell: () => void;
}) {
  const buyCount  = data.filter((r) => r.change_rate <= -2).length;
  const sellCount = data.filter((r) => r.change_rate >= 3).length;
  const avgRate   = data.length === 0 ? 0 :
    Math.round((data.reduce((s, r) => s + r.change_rate, 0) / data.length) * 10) / 10;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* カード① 仕入れ好機 */}
      <button
        type="button"
        onClick={onHighlightBuy}
        className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
      >
        <DashboardCard className="hover:border-emerald-300 transition-colors duration-150 cursor-pointer">
          <CardHeader className="pb-1">
            <CardDescription className="text-emerald-600 font-medium">仕入れ好機</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums text-emerald-600">
              {buyCount}
              <span className="ml-2 text-base font-normal text-stone-500">銘柄が割安水準</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            先月比 -2% 以下 ／ クリックでハイライト
          </CardContent>
        </DashboardCard>
      </button>

      {/* カード② 売り時アラート */}
      <button
        type="button"
        onClick={onHighlightSell}
        className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-xl"
      >
        <DashboardCard className="hover:border-red-300 transition-colors duration-150 cursor-pointer">
          <CardHeader className="pb-1">
            <CardDescription className="text-red-700 font-medium">売り時アラート</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums text-red-700">
              {sellCount}
              <span className="ml-2 text-base font-normal text-stone-500">銘柄が高値水準</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            先月比 +3% 以上 ／ 在庫があれば売却を検討
          </CardContent>
        </DashboardCard>
      </button>

      {/* カード③ 市場トレンド */}
      <DashboardCard>
        <CardHeader className="pb-1">
          <CardDescription>市場トレンド</CardDescription>
          <CardTitle className={`text-3xl font-bold tabular-nums ${avgRate > 0 ? "text-emerald-600" : avgRate < 0 ? "text-red-700" : "text-stone-700"}`}>
            {avgRate > 0 ? "↑" : avgRate < 0 ? "↓" : "→"}
            <span className="ml-2 text-xl">{avgRate > 0 ? "+" : ""}{avgRate}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-xs text-muted-foreground">
          {avgRate > 0 ? "市場全体は上昇傾向" : avgRate < 0 ? "市場全体は下落傾向" : "市場は横ばい"}
          （全銘柄の平均変動率）
        </CardContent>
      </DashboardCard>
    </div>
  );
}

// ──────────────────────────────────────────────
// 注目銘柄パネル
// ──────────────────────────────────────────────
function SpotlightPanel({ item }: { item: MarketWatchItem }) {
  const jaName = BRAND_JA[item.brand] ?? item.brand;
  const priceYen  = item.this_week_price * 10000;
  const changeYen = item.change_amount * 10000;
  const isBuy = item.change_rate <= -2;
  const isSell = item.change_rate >= 3;

  return (
    <div className="flex flex-col gap-2 rounded-r-lg border-l-4 border-red-700 bg-stone-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-red-700">今月の注目銘柄</p>
      <div>
        <p className="text-lg font-bold text-stone-900">
          {jaName}　{item.model}
        </p>
        <p className="font-mono text-xs text-stone-400">{item.ref_number}</p>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="text-stone-700">
          市場価格: <span className="font-bold tabular-nums">¥{priceYen.toLocaleString("ja-JP")}</span>
        </span>
        <span className={item.change_rate > 0 ? "text-emerald-600" : "text-red-700"}>
          先月比: <span className="font-bold tabular-nums">
            {changeYen >= 0 ? "+" : ""}¥{changeYen.toLocaleString("ja-JP")}
            （{item.change_rate > 0 ? "+" : ""}{item.change_rate}%）
          </span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <JudgmentBadge rate={item.change_rate} />
        <span className="text-xs text-stone-500">
          {isBuy
            ? "価格が下がっています。仕入れ好機と判断されます"
            : isSell
            ? "価格上昇トレンド継続中。在庫があれば売却を検討してください"
            : "市場価格は比較的安定しています"}
        </span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// メインコンポーネント
// ──────────────────────────────────────────────
export function MarketWatchClient() {
  const data: MarketWatchItem[] = mockMarketWatchItems;

  const [highlightMode, setHighlightMode] = useState<"buy" | "sell" | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(MOCK_UPDATED_AT);

  // 注目銘柄: 変動率の絶対値が最大
  const spotlightItem = useMemo(() =>
    [...data].sort((a, b) => Math.abs(b.change_rate) - Math.abs(a.change_rate))[0] ?? data[0],
    [data],
  );

  function handleHighlightBuy() {
    setHighlightMode((prev) => prev === "buy" ? null : "buy");
  }
  function handleHighlightSell() {
    setHighlightMode((prev) => prev === "sell" ? null : "sell");
  }

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdated("たった今");
    }, 600);
  }

  return (
    <div className="space-y-6">

      {/* ヘッダーエリア：最終更新 + モックバッジ + 更新ボタン */}
      <div className="flex items-center justify-end gap-3">
        <span className="rounded border border-stone-200 px-2 py-0.5 text-xs text-stone-400">
          モックデータ表示中
        </span>
        <span className="text-xs text-stone-400">最終更新: {lastUpdated}</span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "更新中…" : "データ更新"}
        </Button>
      </div>

      {/* セクション1: サマリーカード */}
      <SummaryCards
        data={data}
        onHighlightBuy={handleHighlightBuy}
        onHighlightSell={handleHighlightSell}
      />

      {/* セクション2: 注目銘柄パネル */}
      {spotlightItem && <SpotlightPanel item={spotlightItem} />}

      {/* セクション3: テーブル */}
      <DashboardCard>
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">銘柄別価格推移</CardTitle>
              <CardDescription>先月・今月の市場参考価格と仕入れ判断</CardDescription>
            </div>
            {highlightMode && (
              <button
                type="button"
                onClick={() => setHighlightMode(null)}
                className="mt-0.5 rounded border border-stone-200 px-2 py-0.5 text-xs text-stone-500 hover:bg-stone-50"
              >
                ハイライト解除
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-hidden rounded-md border border-stone-200">
            <Table>
              <TableHeader className="bg-stone-50">
                <TableRow className="hover:bg-stone-50 [&>th]:text-stone-500 [&>th]:text-xs [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-wide">
                  <TableHead>ブランド</TableHead>
                  <TableHead>モデル / Ref.</TableHead>
                  <TableHead className="text-right">市場価格（今月）</TableHead>
                  <TableHead className="text-right">先月比</TableHead>
                  <TableHead className="text-center">仕入れ判断</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => {
                  const isBuyHighlight  = highlightMode === "buy"  && row.change_rate <= -2;
                  const isSellHighlight = highlightMode === "sell" && row.change_rate >= 3;
                  const isDimmed = highlightMode !== null && !isBuyHighlight && !isSellHighlight;
                  const jaName = BRAND_JA[row.brand] ?? row.brand;

                  return (
                    <TableRow
                      key={row.ref_number}
                      className={[
                        "group relative border-stone-100 transition-all duration-150",
                        isBuyHighlight  ? "bg-emerald-50/60" : "",
                        isSellHighlight ? "bg-red-50/60"     : "",
                        isDimmed        ? "opacity-30"       : "hover:bg-stone-50",
                      ].join(" ")}
                    >
                      {/* 左ボーダースライドイン */}
                      <TableCell className="border-l-[3px] border-l-transparent whitespace-nowrap font-semibold text-stone-800 transition-colors duration-150 group-hover:border-l-[#8B0000]">
                        {jaName}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[220px] truncate text-sm text-stone-700">{row.model}</div>
                        <div className="font-mono text-xs text-stone-400">{row.ref_number}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="tabular-nums text-sm font-semibold text-stone-900">
                          {(row.this_week_price * 10000).toLocaleString("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 })}
                        </span>
                        <div className="text-xs text-stone-400 tabular-nums">
                          先月 {(row.last_week_price * 10000).toLocaleString("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <RateCell rate={row.change_rate} />
                      </TableCell>
                      <TableCell className="text-center">
                        <JudgmentBadge rate={row.change_rate} />
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
