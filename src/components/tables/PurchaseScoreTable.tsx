"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PurchaseScoreItem } from "@/types/purchaseScore";

function scoreBadgeClass(score: number): string {
  if (score >= 80) return "bg-red-700 text-white";
  if (score >= 50) return "bg-amber-500/90 text-stone-950";
  return "bg-stone-400 text-white";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "優先";
  if (score >= 50) return "通常";
  return "保留";
}

function actionLabel(action: PurchaseScoreItem["action"]): string {
  if (action === "priority") return "優先";
  if (action === "normal") return "通常";
  return "保留";
}

function actionClass(action: PurchaseScoreItem["action"]): string {
  if (action === "priority") return "text-red-700 font-semibold";
  if (action === "normal") return "text-stone-600";
  return "text-amber-600";
}

const channelLabel: Record<PurchaseScoreItem["channel"], string> = {
  auction: "オークション",
  dealer: "ディーラー",
  individual: "個人買取",
};

export function PurchaseScoreTable({ data }: { data: PurchaseScoreItem[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "rank", desc: false },
  ]);

  const columns = useMemo<ColumnDef<PurchaseScoreItem>[]>(
    () => [
      {
        accessorKey: "rank",
        header: "順位",
        size: 64,
        cell: ({ getValue }) => (
          <span className="font-mono text-sm text-stone-500">
            {getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: "brand",
        header: "ブランド",
        cell: ({ getValue }) => (
          <span className="font-medium text-stone-800">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "model",
        header: "モデル",
        cell: ({ getValue }) => (
          <span className="text-sm text-stone-700 max-w-[300px] block truncate">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "ref_number",
        header: "Ref.",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-stone-500">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "score",
        header: "スコア",
        cell: ({ row }) => {
          const s = row.original.score;
          return (
            <span
              className={`inline-flex min-w-[5rem] items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold ${scoreBadgeClass(s)}`}
            >
              {s}（{scoreLabel(s)}）
            </span>
          );
        },
      },
      {
        accessorKey: "turnover_months",
        header: "回転（月）",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-sm">
            {Number(getValue()).toFixed(1)}
          </span>
        ),
      },
      {
        accessorKey: "stock_count",
        header: "在庫本数",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-sm">{getValue() as number}</span>
        ),
      },
      {
        accessorKey: "price_band",
        header: "価格帯",
        cell: ({ getValue }) => (
          <span className="text-xs text-stone-600 bg-stone-100 rounded px-2 py-0.5">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "channel",
        header: "仕入区分",
        cell: ({ row }) => (
          <span className="text-sm text-stone-600">
            {channelLabel[row.original.channel]}
          </span>
        ),
      },
      {
        accessorKey: "action",
        header: "推奨",
        cell: ({ row }) => (
          <span className={`text-sm font-medium ${actionClass(row.original.action)}`}>
            {actionLabel(row.original.action)}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-md border border-stone-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-stone-50 [&_tr]:border-stone-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-stone-50">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="cursor-pointer select-none whitespace-nowrap text-stone-500 text-xs font-semibold uppercase tracking-wide py-3"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: " ↑",
                    desc: " ↓",
                  }[header.column.getIsSorted() as string] ?? null}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row, i) => (
            <TableRow
              key={row.id}
              className={`group relative border-stone-100 transition-all duration-150 ${
                i % 2 === 1 ? "bg-stone-50/50 hover:bg-stone-100/60" : "hover:bg-stone-50"
              }`}
            >
              {row.getVisibleCells().map((cell, ci) => (
                <TableCell
                  key={cell.id}
                  className={`whitespace-nowrap py-3 ${
                    ci === 0
                      ? "border-l-[3px] border-l-transparent transition-colors duration-150 group-hover:border-l-[#8B0000]"
                      : ""
                  }`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
