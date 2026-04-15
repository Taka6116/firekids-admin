import type { PurchaseScoreItem } from "@/types/purchaseScore";

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatRow(row: PurchaseScoreItem): string {
  const cells = [
    String(row.rank),
    row.brand,
    row.model,
    row.ref_number,
    String(row.score),
    String(row.turnover_months),
    String(row.stock_count),
    row.price_band,
    row.channel,
    row.action,
  ].map((c) => escapeCsvCell(c));
  return cells.join(",");
}

const HEADER =
  "rank,brand,model,ref_number,score,turnover_months,stock_count,price_band,channel,action";

/**
 * 仕様: export_purchase_score_YYYYMMDD.csv（UTF-8 BOM 付きで Excel 向け）
 */
export function buildPurchaseScoreCsv(rows: PurchaseScoreItem[]): string {
  const lines = [HEADER, ...rows.map(formatRow)];
  return `\uFEFF${lines.join("\r\n")}`;
}

export function purchaseScoreCsvFilename(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `export_purchase_score_${y}${m}${day}.csv`;
}

export function downloadPurchaseScoreCsv(rows: PurchaseScoreItem[]): void {
  const blob = new Blob([buildPurchaseScoreCsv(rows)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = purchaseScoreCsvFilename();
  a.click();
  URL.revokeObjectURL(url);
}
