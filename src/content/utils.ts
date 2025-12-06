export interface TokenMetrics {
  mc?: number;
  liquidity?: number;
  volume5m?: number;
  volume1h?: number;
  buys?: number;
  sells?: number;
  holderCount?: number;
}

export const parseKMB = (str: string): number => {
  if (!str) return 0;
  const s = str.toUpperCase().replace(/[^0-9.KMB]/g, "");
  let multiplier = 1;
  if (s.includes("K")) multiplier = 1000;
  if (s.includes("M")) multiplier = 1000000;
  if (s.includes("B")) multiplier = 1000000000;
  return parseFloat(s) * multiplier;
};
