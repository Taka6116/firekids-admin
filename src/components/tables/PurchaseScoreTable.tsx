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
  if (score >= 80) {
    return "bg-red-700 text-white";
  }
  if (score >= 50) {
    return "bg-amber-500/90 text-stone-950";
  }
  return "bg-stone-500 text-white";
}

function scoreLabel(score: number): string {
  if (score >= 80) {
    return "優先";
  }
  if (score >= 50) {
    return "通常";
  }
  return "保留";
}

const channelLabel: Record<PurchaseScoreItem["channel"], string> = {
  auction: "オークション",
  dealer: "ディーラー",
  individual: "個人買取",
};

const actionLabel: Record<PurchaseScoreItem["action"], string> = {
  priority: "優先",
  normal: "通常",
  hold: "保留",
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
      },
      {
        accessorKey: "brand",
        header: "ブランド",
      },
      {
        accessorKey: "model",
        header: "モデル",
      },
      {
        accessorKey: "ref_number",
        header: "Ref.",
      },
      {
        accessorKey: "score",
        header: "スコア",
        cell: ({ row }) => {
          const s = row.original.score;
          return (
            <span
              className={`inline-flex min-w-[4.5rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${scoreBadgeClass(s)}`}
            >
              {s}（{scoreLabel(s)}）
            </span>
          );
        },
      },
      {
        accessorKey: "turnover_months",
        header: "回転（月）",
        cell: ({ getValue }) => Number(getValue()).toFixed(1),
      },
      {
        accessorKey: "stock_count",
        header: "在庫本数",
      },
      {
        accessorKey: "price_band",
        header: "価格帯",
      },
      {
        accessorKey: "channel",
        header: "仕入区分",
        cell: ({ row }) => channelLabel[row.original.channel],
      },
      {
        accessorKey: "action",
        header: "推奨",
        cell: ({ row }) => actionLabel[row.original.action],
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
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-card shadow-sm [&_tr]:border-border">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="hover:bg-transparent">
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className="cursor-pointer select-none whitespace-nowrap text-muted-foreground"
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
            className={i % 2 === 1 ? "bg-muted/25 hover:bg-muted/35" : "hover:bg-muted/20"}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="whitespace-nowrap">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
