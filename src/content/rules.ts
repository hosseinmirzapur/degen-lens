import { TokenMetrics } from "./utils";

export type Classification = "risky" | "pumpable" | "stable" | "neutral";

export interface Thresholds {
  pumpMinMc: number;
  pumpMaxMc: number;
  pumpMinVol: number;
  pumpBuySellRatio: number;
  riskMaxVol: number;
  riskSellBuyRatio: number;
  stableMinMc: number;
  stableMinVol: number;
  maxAge?: number; // in minutes
  maxDevHolding?: number; // percentage
  minHolders?: number;
  minProTraders?: number;
  maxSnipers?: number; // percentage
  maxInsiders?: number; // percentage
}

export const classifyToken = (
  metrics: TokenMetrics,
  thresholds: Thresholds
): Classification => {
  const {
    mc = 0,
    volume5m = 0,
    buys = 0,
    sells = 0,
    age,
    devHolding,
    holderCount,
    proTraders,
    snipers,
    insiders,
  } = metrics;

  if (
    thresholds.maxAge !== undefined &&
    age !== undefined &&
    age > thresholds.maxAge
  )
    return "neutral";
  if (
    thresholds.maxDevHolding !== undefined &&
    devHolding !== undefined &&
    devHolding > thresholds.maxDevHolding
  )
    return "neutral";
  if (
    thresholds.minHolders !== undefined &&
    holderCount !== undefined &&
    holderCount < thresholds.minHolders
  )
    return "neutral";
  if (
    thresholds.minProTraders !== undefined &&
    proTraders !== undefined &&
    proTraders < thresholds.minProTraders
  )
    return "neutral";
  if (
    thresholds.maxSnipers !== undefined &&
    snipers !== undefined &&
    snipers > thresholds.maxSnipers
  )
    return "neutral";
  if (
    thresholds.maxInsiders !== undefined &&
    insiders !== undefined &&
    insiders > thresholds.maxInsiders
  )
    return "neutral";

  // RULE SET 1: PUMPABLE
  // Low MC, decent volume, buy pressure
  if (
    mc > thresholds.pumpMinMc &&
    mc < thresholds.pumpMaxMc &&
    volume5m > thresholds.pumpMinVol &&
    buys > sells * thresholds.pumpBuySellRatio
  ) {
    return "pumpable";
  }

  // RULE SET 2: RISKY
  // Tiny volume or massive sell pressure
  if (
    volume5m < thresholds.riskMaxVol ||
    sells > buys * thresholds.riskSellBuyRatio
  ) {
    return "risky";
  }

  // RULE SET 3: STABLE
  // High MC, deep volume
  if (mc > thresholds.stableMinMc && volume5m > thresholds.stableMinVol) {
    return "stable";
  }

  return "neutral";
};
