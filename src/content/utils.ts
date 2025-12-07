export interface TokenMetrics {
  mc?: number;
  liquidity?: number;
  volume5m?: number;
  volume1h?: number;
  buys?: number;
  sells?: number;
  holderCount?: number;
  age?: number; // in minutes
  devHolding?: number; // percentage
  proTraders?: number;
  snipers?: number; // percentage
  insiders?: number; // percentage
}

export const parseKMB = (str: string): number => {
  if (!str) return 0;
  let cleaned = str.toUpperCase().replace(/[^0-9.KMB]/g, "");
  let multiplier = 1;
  if (cleaned.endsWith("B")) {
    multiplier = 1000000000;
    cleaned = cleaned.slice(0, -1);
  } else if (cleaned.endsWith("M")) {
    multiplier = 1000000;
    cleaned = cleaned.slice(0, -1);
  } else if (cleaned.endsWith("K")) {
    multiplier = 1000;
    cleaned = cleaned.slice(0, -1);
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num * multiplier;
};
