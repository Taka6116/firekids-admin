import type { BudgetSimulation } from "@/types/budget";
import type { MatrixItem } from "@/types/matrix";
import type { PurchaseScoreItem } from "@/types/purchaseScore";

export const mockPurchaseScores: PurchaseScoreItem[] = [
  {
    rank: 1,
    brand: "ROLEX",
    model: "サブマリーナー",
    ref_number: "126610LN",
    score: 88,
    turnover_months: 2.1,
    stock_count: 4,
    price_band: "100万円台",
    channel: "auction",
    action: "priority",
  },
  {
    rank: 2,
    brand: "PATEK PHILIPPE",
    model: "ノーチラス",
    ref_number: "5711/1A",
    score: 82,
    turnover_months: 4.5,
    stock_count: 2,
    price_band: "1000万円台",
    channel: "dealer",
    action: "priority",
  },
  {
    rank: 3,
    brand: "ROLEX",
    model: "デイトナ",
    ref_number: "116500LN",
    score: 79,
    turnover_months: 2.8,
    stock_count: 3,
    price_band: "200万円台",
    channel: "auction",
    action: "normal",
  },
  {
    rank: 4,
    brand: "AUDEMARS PIGUET",
    model: "ロイヤルオーク",
    ref_number: "15500ST",
    score: 71,
    turnover_months: 5.2,
    stock_count: 2,
    price_band: "300万円台",
    channel: "dealer",
    action: "normal",
  },
  {
    rank: 5,
    brand: "CARTIER",
    model: "タンク",
    ref_number: "WSTA0052",
    score: 64,
    turnover_months: 6.1,
    stock_count: 7,
    price_band: "50万円台",
    channel: "individual",
    action: "normal",
  },
  {
    rank: 6,
    brand: "OMEGA",
    model: "スピードマスター",
    ref_number: "310.30.42.50.01.002",
    score: 58,
    turnover_months: 7.4,
    stock_count: 9,
    price_band: "50万円台",
    channel: "dealer",
    action: "normal",
  },
  {
    rank: 7,
    brand: "IWC",
    model: "ポルトギーゼ",
    ref_number: "IW371604",
    score: 52,
    turnover_months: 8.2,
    stock_count: 5,
    price_band: "100万円台",
    channel: "auction",
    action: "normal",
  },
  {
    rank: 8,
    brand: "TAG HEUER",
    model: "カレラ",
    ref_number: "CBN2012",
    score: 48,
    turnover_months: 9.0,
    stock_count: 12,
    price_band: "20万円台",
    channel: "individual",
    action: "hold",
  },
  {
    rank: 9,
    brand: "SEIKO",
    model: "グランドセイコー",
    ref_number: "SBGA211",
    score: 44,
    turnover_months: 10.2,
    stock_count: 14,
    price_band: "50万円台",
    channel: "individual",
    action: "hold",
  },
  {
    rank: 10,
    brand: "TUDOR",
    model: "ブラックベイ",
    ref_number: "M7941A1A0RU",
    score: 41,
    turnover_months: 11.5,
    stock_count: 10,
    price_band: "30万円台",
    channel: "dealer",
    action: "hold",
  },
];

export const mockMatrixItems: MatrixItem[] = [
  { brand: "ROLEX", model: "デイトナ", x_turnover: 1.8, y_gross_margin: 24, bubble_size: 6, channel: "auction" },
  { brand: "ROLEX", model: "GMTマスターII", x_turnover: 2.2, y_gross_margin: 21, bubble_size: 5, channel: "dealer" },
  { brand: "PATEK PHILIPPE", model: "ノーチラス", x_turnover: 4.1, y_gross_margin: 26, bubble_size: 2, channel: "auction" },
  { brand: "AUDEMARS PIGUET", model: "ロイヤルオーク", x_turnover: 6.5, y_gross_margin: 9, bubble_size: 2, channel: "auction" },
  { brand: "CARTIER", model: "タンク", x_turnover: 5.2, y_gross_margin: 18, bubble_size: 4, channel: "dealer" },
  { brand: "OMEGA", model: "スピードマスター", x_turnover: 7.8, y_gross_margin: 11, bubble_size: 7, channel: "individual" },
  { brand: "SEIKO", model: "グランドセイコー", x_turnover: 9.4, y_gross_margin: 13, bubble_size: 8, channel: "individual" },
  { brand: "IWC", model: "ビッグパイロット", x_turnover: 5.8, y_gross_margin: 15, bubble_size: 3, channel: "dealer" },
  { brand: "JAEGER", model: "レベルソ", x_turnover: 8.2, y_gross_margin: 16, bubble_size: 3, channel: "dealer" },
  { brand: "BREGUET", model: "トラディション", x_turnover: 10.5, y_gross_margin: 19, bubble_size: 2, channel: "auction" },
  { brand: "PANERAI", model: "ルミノール", x_turnover: 6.9, y_gross_margin: 10, bubble_size: 5, channel: "individual" },
  { brand: "TAG HEUER", model: "モナコ", x_turnover: 11.2, y_gross_margin: 8, bubble_size: 6, channel: "individual" },
  { brand: "TUDOR", model: "ペラゴス", x_turnover: 4.6, y_gross_margin: 14, bubble_size: 5, channel: "dealer" },
  { brand: "ZENITH", model: "クロノマスター", x_turnover: 7.1, y_gross_margin: 12, bubble_size: 4, channel: "auction" },
];

export const mockBudgetSimulation: BudgetSimulation = {
  total_budget: 200_000_000,
  month: "2026-04",
  channels: {
    auction: {
      name: "オークション",
      current_amount: 80_000_000,
      suggested_amount: 95_000_000,
      current_ratio: 40,
      suggested_ratio: 47.5,
      purchase_count: 42,
    },
    dealer: {
      name: "ディーラー",
      current_amount: 90_000_000,
      suggested_amount: 75_000_000,
      current_ratio: 45,
      suggested_ratio: 37.5,
      purchase_count: 28,
      dealers: [
        { name: "JWA", amount: 30_000_000, ratio: 40 },
        { name: "大吉", amount: 35_000_000, ratio: 46.7 },
        { name: "オークネット", amount: 10_000_000, ratio: 13.3 },
      ],
    },
    individual: {
      name: "個人買取",
      current_amount: 30_000_000,
      suggested_amount: 30_000_000,
      current_ratio: 15,
      suggested_ratio: 15,
      purchase_count: 15,
    },
  },
};

// ─── 市場価格ウォッチ ───────────────────────────────────────────
export type MarketWatchItem = {
  brand: string;
  model: string;
  ref_number: string;
  last_week_price: number; // 万円（UIでは先月相当として表示）
  this_week_price: number; // 万円（UIでは今月相当として表示）
  change_amount: number;   // 今月 − 先月（万円、モックでは直接入力）
  change_rate: number;     // 変動率（%）
};

export const mockMarketWatchItems: MarketWatchItem[] = [
  { brand: "ROLEX", model: "サブマリーナー 126610LN", ref_number: "126610LN", last_week_price: 145, this_week_price: 152, change_amount: 7, change_rate: 4.8 },
  { brand: "ROLEX", model: "デイトナ 116500LN", ref_number: "116500LN", last_week_price: 380, this_week_price: 395, change_amount: 15, change_rate: 3.9 },
  { brand: "ROLEX", model: "GMTマスターII 126710BLRO", ref_number: "126710BLRO", last_week_price: 168, this_week_price: 165, change_amount: -3, change_rate: -1.8 },
  { brand: "PATEK PHILIPPE", model: "ノーチラス 5711/1A", ref_number: "5711/1A", last_week_price: 1850, this_week_price: 1820, change_amount: -30, change_rate: -1.6 },
  { brand: "AUDEMARS PIGUET", model: "ロイヤルオーク 15500ST", ref_number: "15500ST", last_week_price: 420, this_week_price: 435, change_amount: 15, change_rate: 3.6 },
  { brand: "CARTIER", model: "タンク マスト WSTA0052", ref_number: "WSTA0052", last_week_price: 62, this_week_price: 62, change_amount: 0, change_rate: 0.0 },
  { brand: "OMEGA", model: "スピードマスター 310.30.42.50.01.002", ref_number: "310.30.42.50.01.002", last_week_price: 88, this_week_price: 85, change_amount: -3, change_rate: -3.4 },
  { brand: "IWC", model: "ポルトギーゼ IW371604", ref_number: "IW371604", last_week_price: 110, this_week_price: 115, change_amount: 5, change_rate: 4.5 },
];

// ─── 含み益トラッカー ──────────────────────────────────────────
export type UnrealizedGainItem = {
  brand: string;
  model: string;
  ref_number: string;
  purchase_price: number;  // 仕入価格（万円）
  market_price: number;    // 現在市場価格（万円）
  unrealized_gain: number; // market_price - purchase_price（万円）
  gain_rate: number;       // unrealized_gain / purchase_price × 100（%）
  purchase_date: string;   // "YYYY-MM-DD"
};

export const mockUnrealizedGainItems: UnrealizedGainItem[] = [
  { brand: "ROLEX", model: "サブマリーナー 126610LN", ref_number: "126610LN", purchase_price: 128, market_price: 152, unrealized_gain: 24, gain_rate: 18.8, purchase_date: "2025-11-10" },
  { brand: "ROLEX", model: "デイトナ 116500LN", ref_number: "116500LN", purchase_price: 340, market_price: 395, unrealized_gain: 55, gain_rate: 16.2, purchase_date: "2025-12-05" },
  { brand: "PATEK PHILIPPE", model: "ノーチラス 5711/1A", ref_number: "5711/1A", purchase_price: 1950, market_price: 1820, unrealized_gain: -130, gain_rate: -6.7, purchase_date: "2025-09-20" },
  { brand: "AUDEMARS PIGUET", model: "ロイヤルオーク 15500ST", ref_number: "15500ST", purchase_price: 390, market_price: 435, unrealized_gain: 45, gain_rate: 11.5, purchase_date: "2026-01-15" },
  { brand: "OMEGA", model: "スピードマスター 310.30.42.50.01.002", ref_number: "310.30.42.50.01.002", purchase_price: 95, market_price: 85, unrealized_gain: -10, gain_rate: -10.5, purchase_date: "2025-10-01" },
  { brand: "IWC", model: "ポルトギーゼ IW371604", ref_number: "IW371604", purchase_price: 98, market_price: 115, unrealized_gain: 17, gain_rate: 17.3, purchase_date: "2026-02-08" },
  { brand: "CARTIER", model: "タンク マスト WSTA0052", ref_number: "WSTA0052", purchase_price: 58, market_price: 62, unrealized_gain: 4, gain_rate: 6.9, purchase_date: "2026-03-01" },
];

// ─── 回転率アラート ────────────────────────────────────────────
export type TurnoverAlertItem = {
  brand: string;
  model: string;
  ref_number: string;
  purchase_date: string;    // "YYYY-MM-DD"
  purchase_price: number; // 仕入価格（万円）— 機会損失の仮計算用
  elapsed_months: number;   // 仕入からの経過月数
  expected_months: number;  // そのモデルの想定回転月数
  deviation: number;        // elapsed_months - expected_months（正＝遅延）
  alert_level: "red" | "yellow" | "green";
};

export const mockTurnoverAlertItems: TurnoverAlertItem[] = [
  { brand: "TAG HEUER", model: "カレラ CBN2012", ref_number: "CBN2012", purchase_date: "2025-06-10", purchase_price: 85, elapsed_months: 10.3, expected_months: 4.0, deviation: 6.3, alert_level: "red" },
  { brand: "SEIKO", model: "グランドセイコー SBGA211", ref_number: "SBGA211", purchase_date: "2025-07-20", purchase_price: 62, elapsed_months: 9.0, expected_months: 5.5, deviation: 3.5, alert_level: "red" },
  { brand: "OMEGA", model: "スピードマスター 310.30.42.50.01.002", ref_number: "310.30.42.50.01.002", purchase_date: "2025-10-01", purchase_price: 88, elapsed_months: 6.6, expected_months: 5.0, deviation: 1.6, alert_level: "yellow" },
  { brand: "TUDOR", model: "ブラックベイ M7941A1A0RU", ref_number: "M7941A1A0RU", purchase_date: "2025-09-05", purchase_price: 45, elapsed_months: 7.5, expected_months: 6.0, deviation: 1.5, alert_level: "yellow" },
  { brand: "CARTIER", model: "タンク マスト WSTA0052", ref_number: "WSTA0052", purchase_date: "2026-01-15", purchase_price: 58, elapsed_months: 3.2, expected_months: 5.0, deviation: -1.8, alert_level: "green" },
  { brand: "ROLEX", model: "サブマリーナー 126610LN", ref_number: "126610LN", purchase_date: "2025-11-10", purchase_price: 128, elapsed_months: 5.3, expected_months: 2.5, deviation: 2.8, alert_level: "yellow" },
  { brand: "IWC", model: "ポルトギーゼ IW371604", ref_number: "IW371604", purchase_date: "2026-02-08", purchase_price: 98, elapsed_months: 2.4, expected_months: 6.0, deviation: -3.6, alert_level: "green" },
];

export type BrandAllocationRow = {
  id: string;
  name: string;
  ratioPercent: number;
};

/** ブランド配分スライダー用（合計100%想定） */
export const mockBrandAllocationDefaults: BrandAllocationRow[] = [
  { id: "rolex", name: "ROLEX", ratioPercent: 28 },
  { id: "patek", name: "PATEK PHILIPPE", ratioPercent: 18 },
  { id: "ap", name: "AUDEMARS PIGUET", ratioPercent: 14 },
  { id: "cartier", name: "CARTIER", ratioPercent: 12 },
  { id: "others", name: "その他ブランド", ratioPercent: 28 },
];
