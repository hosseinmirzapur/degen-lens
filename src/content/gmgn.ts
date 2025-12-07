import { parseKMB, type TokenMetrics } from "./utils";
import { classifyToken, type Thresholds } from "./rules";
import { highlightElement } from "./highlighter";

// Unified selector: adjust based on GMGN's structure for chart and table
const GMGN_ROW = "div.g-table-body div[data-index], .chart-item"; // Assume chart items have class .chart-item

// Section Detection: Placeholder, adjust based on GMGN sections
const getSectionForRow = (row: HTMLElement): string => {
  const sectionElement = row.closest("div.section-header"); // Adjust selector
  if (!sectionElement) return "default";

  const headerSpan = sectionElement.querySelector("span.section-title");
  return headerSpan?.textContent?.trim() || "default";
};

// Thresholds: Similar to axiom, adjusted for GMGN limited metrics
const defaultThresholds: Thresholds = {
  pumpMinMc: 7000,
  pumpMaxMc: 100000,
  pumpMinVol: 5000,
  pumpBuySellRatio: 2,
  riskMaxVol: 0, // No volume-based risk since buys/sells not available
  riskSellBuyRatio: 3,
  stableMinMc: 1000000,
  stableMinVol: 100000,
};

const newPairsThresholds: Thresholds = {
  pumpMinMc: 7000,
  pumpMaxMc: 50000,
  pumpMinVol: 1000,
  pumpBuySellRatio: 1.5,
  riskMaxVol: 500,
  riskSellBuyRatio: 3,
  stableMinMc: 500000,
  stableMinVol: 50000,
  maxAge: 3,
  maxDevHolding: 9,
};

const finalStretchThresholds: Thresholds = {
  pumpMinMc: 8000,
  pumpMaxMc: 75000,
  pumpMinVol: 3000,
  pumpBuySellRatio: 1.8,
  riskMaxVol: 750,
  riskSellBuyRatio: 3,
  stableMinMc: 750000,
  stableMinVol: 75000,
  maxAge: 40,
  maxDevHolding: 10,
  minProTraders: 10,
  maxSnipers: 40,
  maxInsiders: 30,
};

const migratedThresholds: Thresholds = {
  pumpMinMc: 20000,
  pumpMaxMc: 150000,
  pumpMinVol: 10000,
  pumpBuySellRatio: 2.5,
  riskMaxVol: 1500,
  riskSellBuyRatio: 3,
  stableMinMc: 1500000,
  stableMinVol: 150000,
  minHolders: 50,
  minProTraders: 50,
};

const getSectionKey = (section: string): string => {
  switch (section) {
    case "New":
      return "newPairs";
    case "Almost Bonded":
      return "finalStretch";
    case "Migrated":
      return "migrated";
    default:
      return "default";
  }
};

// Main Parser: Similar to axiom
export const parseGMGN = async () => {
  const stored = await chrome.storage.sync.get(null);

  const allGroups = document.querySelectorAll<HTMLElement>(GMGN_ROW);
  const rows = Array.from(allGroups).filter(el => !el.dataset.thProcessed);

  if (rows.length === 0) {
    return; // Early exit
  }

  for (const row of rows) {
    const el = row as HTMLElement;

    const sectionName = getSectionForRow(el);
    const sectionKey = getSectionKey(sectionName);

    const sectionDefaultsMap: Record<string, Thresholds> = {
      newPairs: newPairsThresholds,
      finalStretch: finalStretchThresholds,
      migrated: migratedThresholds,
      default: defaultThresholds,
    };

    const base = sectionDefaultsMap[sectionKey] || defaultThresholds;
    const thresholds: Thresholds = { ...base };

    Object.keys(base).forEach(key => {
      const storedKey = sectionKey === "default" ? key : `${sectionKey}_${key}`;
      if (stored[storedKey] !== undefined) {
        (thresholds as any)[key] = stored[storedKey];
      }
    });

    // Metrics Extraction: Based on stub, simplified for GMGN
    // Get the main content div
    const rowContent = el.querySelector(
      "div.relative.flex.items-center.px-12px.flex-1.gap-8px.overflow-hidden.w-full.text-sm.cursor-pointer"
    ) as HTMLElement;
    let metrics: TokenMetrics;
    if (!rowContent) {
      metrics = { mc: 0, volume5m: 0, buys: 0, sells: 0 };
    } else {
      // Find MC value
      const mcLabel = Array.from(rowContent.querySelectorAll("span")).find(
        span => span.textContent?.trim() === "MC"
      );
      const mcText =
        mcLabel?.nextElementSibling
          ?.querySelector("span")
          ?.textContent?.trim() ?? "0";

      // Find Volume (V) as volume5m
      const liqLabel = Array.from(rowContent.querySelectorAll("span")).find(
        span => span.textContent?.trim() === "V"
      );
      const liqText =
        liqLabel?.nextElementSibling
          ?.querySelector("span")
          ?.textContent?.trim() ?? "0";

      // GMGN may not have detailed metrics, so set others to 0
      metrics = {
        mc: parseKMB(mcText),
        volume5m: parseKMB(liqText),
        buys: 0,
        sells: 0,
        age: 0,
        devHolding: 0,
        holderCount: 0,
        proTraders: 0,
        snipers: 0,
        insiders: 0,
      };
    }

    // Classify & Highlight
    const classification = classifyToken(metrics, thresholds);

    highlightElement(el, classification);

    el.dataset.thProcessed = "true";
  }
};
