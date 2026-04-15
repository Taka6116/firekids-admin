"use client";

import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import { useEffect, useMemo, useRef, useState } from "react";

import { DashboardCard } from "@/components/layout/DashboardCard";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  getMatrixZone,
  matrixMedians,
  matrixZoneColor,
  matrixZoneLabel,
  turnoverSpeedScore,
  type MatrixZone,
} from "@/lib/matrixPlot";
import type { MatrixItem } from "@/types/matrix";

type PlotDatum = {
  x: number;
  y: number;
  size: number;
  brand: string;
  model: string;
  channel: MatrixItem["channel"];
  turnoverMonths: number;
  grossMargin: number;
  zone: MatrixZone;
};

const ZONE_ORDER: MatrixZone[] = [
  "star",
  "golden_tree",
  "problem_child",
  "underdog",
];

function buildPlotData(
  items: MatrixItem[],
  mids: { midSpeed: number; midMargin: number },
): PlotDatum[] {
  return items.map((row) => {
    const speed = turnoverSpeedScore(row.x_turnover);
    const margin = row.y_gross_margin;
    const zone = getMatrixZone(speed, margin, mids.midSpeed, mids.midMargin);
    return {
      x: speed,
      y: margin,
      size: 10 + row.bubble_size * 5,
      brand: row.brand,
      model: row.model,
      channel: row.channel,
      turnoverMonths: row.x_turnover,
      grossMargin: row.y_gross_margin,
      zone,
    };
  });
}

export function MatrixScatterPlot({ items }: { items: MatrixItem[] }) {
  const [selected, setSelected] = useState<PlotDatum | null>(null);
  const detailPanelRef = useRef<HTMLDivElement>(null);
  const prevSelectedRef = useRef<PlotDatum | null>(null);

  const { series, colors, midSpeed, midMargin } = useMemo(() => {
    const mids = matrixMedians(items);
    const plot = buildPlotData(items, mids);
    const seriesBuilt = ZONE_ORDER.map((zone) => ({
      id: zone,
      label: matrixZoneLabel[zone],
      data: plot.filter((d) => d.zone === zone),
    })).filter((s) => s.data.length > 0);
    const colorsBuilt = seriesBuilt.map((s) => matrixZoneColor[s.id]);
    return {
      series: seriesBuilt.map((s) => ({
        id: s.label,
        data: s.data,
      })),
      colors: colorsBuilt,
      midSpeed: mids.midSpeed,
      midMargin: mids.midMargin,
    };
  }, [items]);

  const nivoData = useMemo(
    () =>
      series.map((s) => ({
        id: s.id,
        data: s.data.map((d) => ({
          x: d.x,
          y: d.y,
          size: d.size,
          meta: d,
        })),
      })),
    [series],
  );

  useEffect(() => {
    const prev = prevSelectedRef.current;
    prevSelectedRef.current = selected;
    const becameSelected = selected !== null && prev === null;
    if (!becameSelected || !detailPanelRef.current) {
      return;
    }
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    detailPanelRef.current.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
    });
  }, [selected]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,280px)]">
      <DashboardCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            回転スピード × 粗利率（4象限）
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            X は在庫回転の速さ（スコア化）、Y は粗利率（%）。点の大きさは仕入本数の目安です。
          </p>
        </CardHeader>
        <CardContent className="h-[440px] w-full pt-0">
          <ResponsiveScatterPlot
            data={nivoData}
            margin={{ top: 24, right: 24, bottom: 56, left: 64 }}
            xScale={{ type: "linear", min: "auto", max: "auto" }}
            yScale={{ type: "linear", min: "auto", max: "auto" }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              legend: "回転スピード（大きいほど速回転）",
              legendPosition: "middle",
              legendOffset: 42,
              tickSize: 0,
              tickPadding: 10,
            }}
            axisLeft={{
              legend: "粗利率（%）",
              legendPosition: "middle",
              legendOffset: -48,
              tickSize: 0,
              tickPadding: 10,
            }}
            colors={colors as unknown as string[]}
            nodeSize={(node) => {
              const d = node.data as { size?: number };
              return typeof d.size === "number" ? d.size : 14;
            }}
            enableGridX
            enableGridY
            theme={{
              background: "transparent",
              text: { fill: "#525252", fontSize: 11 },
              axis: {
                domain: { line: { stroke: "#d4d4d4" } },
                ticks: { text: { fill: "#525252" } },
                legend: { text: { fill: "#404040", fontSize: 12 } },
              },
              grid: { line: { stroke: "#e5e5e5" } },
              legends: { text: { fill: "#525252" } },
              tooltip: {
                container: {
                  background: "#ffffff",
                  color: "#171717",
                  fontSize: 12,
                  border: "1px solid #e5e5e5",
                  borderRadius: 6,
                },
              },
            }}
            markers={[
              {
                axis: "x",
                value: midSpeed,
                lineStyle: {
                  stroke: "rgba(0,0,0,0.15)",
                  strokeDasharray: "4 4",
                },
              },
              {
                axis: "y",
                value: midMargin,
                lineStyle: {
                  stroke: "rgba(0,0,0,0.15)",
                  strokeDasharray: "4 4",
                },
              },
            ]}
            useMesh
            tooltip={({ node }) => {
              const meta = node.data as { meta?: PlotDatum };
              const d = meta.meta;
              if (!d) {
                return null;
              }
              return (
                <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
                  <div className="font-semibold">
                    {d.brand} {d.model}
                  </div>
                  <div>回転: {d.turnoverMonths.toFixed(1)} ヶ月</div>
                  <div>粗利: {d.grossMargin}%</div>
                  <div className="text-muted-foreground">
                    {matrixZoneLabel[d.zone]}
                  </div>
                </div>
              );
            }}
            onClick={(node) => {
              const meta = node.data as { meta?: PlotDatum };
              if (meta.meta) {
                setSelected(meta.meta);
              }
            }}
          />
        </CardContent>
      </DashboardCard>

      <div className="flex flex-col gap-4">
        <DashboardCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">分析サマリ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs leading-relaxed text-muted-foreground">
            <p>
              中央の破線は、表示中データの<strong className="text-foreground">中央値</strong>
              で区切った4象限です。
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <span className="font-medium text-emerald-700">スター</span>
                ：横（回転の速さ）が中央値以上 かつ 縦（粗利率）が中央値以上
              </li>
              <li>
                <span className="font-medium text-blue-700">金のなる木</span>
                ：横が中央値未満 かつ 縦が中央値以上
              </li>
              <li>
                <span className="font-medium text-orange-700">問題児</span>
                ：横が中央値以上 かつ 縦が中央値未満
              </li>
              <li>
                <span className="font-medium text-slate-600">負け犬</span>
                ：横が中央値未満 かつ 縦が中央値未満
              </li>
            </ul>
          </CardContent>
        </DashboardCard>

        <div
          ref={detailPanelRef}
          className={cn(
            "rounded-xl transition-[box-shadow,ring-color] duration-200 motion-reduce:transition-none",
            selected
              ? "ring-2 ring-[#8B0000]/25 shadow-md"
              : "ring-0 shadow-none",
          )}
        >
          <DashboardCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">モデル詳細</CardTitle>
              <p className="text-xs text-muted-foreground">
                散布図の点をクリックするとここに表示されます。
              </p>
            </CardHeader>
            <CardContent className="text-sm">
              {selected ? (
                <div className="space-y-2">
                  <p className="text-base font-semibold text-foreground">
                    {selected.brand}{" "}
                    <span className="text-muted-foreground">{selected.model}</span>
                  </p>
                  <dl className="grid grid-cols-[6rem_1fr] gap-y-1 text-xs">
                    <dt className="text-muted-foreground">在庫回転</dt>
                    <dd>{selected.turnoverMonths.toFixed(1)} ヶ月</dd>
                    <dt className="text-muted-foreground">粗利率</dt>
                    <dd>{selected.grossMargin}%</dd>
                    <dt className="text-muted-foreground">仕入区分</dt>
                    <dd>
                      {selected.channel === "auction"
                        ? "オークション"
                        : selected.channel === "dealer"
                          ? "ディーラー"
                          : "個人買取"}
                    </dd>
                    <dt className="text-muted-foreground">象限</dt>
                    <dd>{matrixZoneLabel[selected.zone]}</dd>
                  </dl>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  点をクリックしてモデルを選択してください。
                </p>
              )}
            </CardContent>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
