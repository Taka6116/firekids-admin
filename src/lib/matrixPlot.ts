import type { MatrixItem } from "@/types/matrix";

export type MatrixZone =
  | "star"
  | "golden_tree"
  | "problem_child"
  | "underdog";

/** 月数が小さいほど回転が速い → 散布図の X は「速さ」が右に行くよう変換 */
export function turnoverSpeedScore(months: number): number {
  return 120 / Math.max(months, 0.25);
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]!
    : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

export function matrixMedians(rows: MatrixItem[]): {
  midSpeed: number;
  midMargin: number;
} {
  const speeds = rows.map((r) => turnoverSpeedScore(r.x_turnover));
  const margins = rows.map((r) => r.y_gross_margin);
  return {
    midSpeed: median(speeds),
    midMargin: median(margins),
  };
}

export function getMatrixZone(
  speed: number,
  margin: number,
  midSpeed: number,
  midMargin: number,
): MatrixZone {
  const fast = speed >= midSpeed;
  const highMargin = margin >= midMargin;
  if (fast && highMargin) {
    return "star";
  }
  if (!fast && highMargin) {
    return "golden_tree";
  }
  if (fast && !highMargin) {
    return "problem_child";
  }
  return "underdog";
}

export const matrixZoneLabel: Record<MatrixZone, string> = {
  star: "スター（高回転・高粗利）",
  golden_tree: "金のなる木（低回転・高粗利）",
  problem_child: "問題児（高回転・低粗利）",
  underdog: "負け犬（低回転・低粗利）",
};

export const matrixZoneColor: Record<MatrixZone, string> = {
  star: "#22c55e",
  golden_tree: "#3b82f6",
  problem_child: "#f97316",
  underdog: "#64748b",
};
