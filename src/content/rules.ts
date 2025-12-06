import { TokenMetrics } from "./utils";

export type Classification = "risky" | "pumpable" | "stable" | "neutral";

export interface Thresholds {
  pumpMinMc: number;
  pumpMaxMc: number;
  pumpMinLiq: number;
  pumpBuySellRatio: number;
  riskMaxLiq: number;
  riskSellBuyRatio: number;
  stableMinMc: number;
  stableMinLiq: number;
}

export const classifyToken = (
  metrics: TokenMetrics,
  thresholds: Thresholds
): Classification => {
  const { mc = 0, liquidity = 0, buys = 0, sells = 0 } = metrics;

  // RULE SET 1: PUMPABLE
  // Low MC, decent liq, buy pressure
  if (
    mc > thresholds.pumpMinMc &&
    mc < thresholds.pumpMaxMc &&
    liquidity > thresholds.pumpMinLiq &&
    buys > sells * thresholds.pumpBuySellRatio
  ) {
    return "pumpable";
  }

  // RULE SET 2: RISKY
  // Tiny liquidity or massive sell pressure
  if (
    liquidity < thresholds.riskMaxLiq ||
    sells > buys * thresholds.riskSellBuyRatio
  ) {
    return "risky";
  }

  // RULE SET 3: STABLE
  // High MC, deep liquidity
  if (mc > thresholds.stableMinMc && liquidity > thresholds.stableMinLiq) {
    return "stable";
  }

  return "neutral";
};
