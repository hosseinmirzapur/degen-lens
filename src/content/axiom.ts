import { parseKMB, type TokenMetrics } from "./utils";
import { classifyToken, type Thresholds } from "./rules";
import { highlightElement } from "./highlighter";

// Unified selector: .group for all (trade + pulse) — HTML confirms
const AXIOM_ROW = ".group";

// Section Detection: Unchanged, works for Pulse tabs
const getSectionForRow = (row: HTMLElement): string => {
  const sectionElement = row.closest("div.bg-backgroundSecondary");
  if (!sectionElement) return "default";

  const headerSpan = sectionElement.querySelector(
    "span.text-textPrimary.text-\\[16px\\].font-medium.flex-1"
  );
  return headerSpan?.textContent?.trim() || "default";
};

// Thresholds: Add pulse as fallback if detected, but map to existing (e.g., finalStretch for momentum)
const defaultThresholds: Thresholds = {
  pumpMinMc: 7000,
  pumpMaxMc: 100000,
  pumpMinVol: 5000,
  pumpBuySellRatio: 2,
  riskMaxVol: 1000,
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
    case "New Pairs":
      return "newPairs";
    case "Final Stretch":
      return "finalStretch";
    case "Migrated":
      return "migrated";
    default:
      return "default";
  }
};

// Main Parser: Drop pulse selector split, add broad fallback + logs
export const parseAxiom = async () => {
  const stored = await chrome.storage.sync.get(null);

  const allGroups = document.querySelectorAll<HTMLElement>(AXIOM_ROW);
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

    // Metrics Extraction: Unified span query with .closest(".flex") for nesting
    const isCard = !!el.querySelector("p");
    let metrics: TokenMetrics = { mc: 0, volume5m: 0, buys: 0, sells: 0 };

    if (isCard) {
      // CARD PARSING: Assuming similar structure to table rows for metrics extraction
      const valueSpans = el.querySelectorAll('span[style*="color"]');
      const mcStr = valueSpans[0]?.textContent || "0";
      const volumeStr = valueSpans[1]?.textContent || "0"; // Volume from 2nd span (V$)

      const txContainer = Array.from(
        el.querySelectorAll("span.text-textTertiary")
      ).find(span => span.textContent?.includes("TX"));
      const txElement =
        txContainer?.querySelector("span.text-textPrimary") ||
        txContainer?.querySelector("span");
      const totalTx = parseInt(txElement?.textContent || "0");

      const progressDiv = el.querySelector(
        ".bg-secondaryStroke.rounded-full.overflow-hidden"
      );
      const increaseDiv = progressDiv?.querySelector(
        ".bg-increase"
      ) as HTMLElement;
      const decreaseDiv = progressDiv?.querySelector(
        ".bg-decrease"
      ) as HTMLElement;
      const buysPercent = parseFloat(
        increaseDiv?.style.width.replace("%", "") || "0"
      );
      const sellsPercent = parseFloat(
        decreaseDiv?.style.width.replace("%", "") || "0"
      );

      const buys = totalTx * (buysPercent / 100);
      const sells = totalTx * (sellsPercent / 100);

      const ageSpan = el.querySelector("span.text-primaryGreen");
      const ageText = ageSpan?.textContent || "";
      let age = 0;
      if (ageText.includes("m")) age = parseInt(ageText) || 0;
      else if (ageText.includes("h")) age = (parseInt(ageText) || 0) * 60;
      else if (ageText.includes("d")) age = (parseInt(ageText) || 0) * 1440;

      const holdersIcon = Array.from(el.querySelectorAll("i")).find(i =>
        i.classList.contains("ri-group-line")
      );
      const holdersSpan = holdersIcon?.closest(".flex")?.querySelector("span");
      const holderCount = parseInt(holdersSpan?.textContent || "0");

      const proIcon = Array.from(el.querySelectorAll("i")).find(i =>
        i.classList.contains("icon-pro-trader")
      );
      const proSpan = proIcon?.closest(".flex")?.querySelector("span");
      const proTraders = parseInt(proSpan?.textContent || "0");

      const devIcon = Array.from(el.querySelectorAll("i")).find(i =>
        i.classList.contains("ri-user-star-line")
      );
      const devSpan = devIcon?.parentElement?.querySelector(
        "span.text-primaryRed"
      );
      const devHolding = parseFloat(
        devSpan?.textContent?.replace("%", "") || "0"
      );

      const snipersIcon = Array.from(el.querySelectorAll("i")).find(i =>
        i.classList.contains("ri-crosshair-2-line")
      );
      const snipersSpan = snipersIcon?.parentElement?.querySelector(
        "span.text-primaryGreen, span.text-primaryRed"
      );
      const snipers = parseFloat(
        snipersSpan?.textContent?.replace("%", "") || "0"
      );

      const insidersIcon = Array.from(el.querySelectorAll("i")).find(i =>
        i.classList.contains("ri-ghost-line")
      );
      const insidersSpan = insidersIcon?.parentElement?.querySelector(
        "span.text-primaryGreen, span.text-primaryRed"
      );
      const insiders = parseFloat(
        insidersSpan?.textContent?.replace("%", "") || "0"
      );

      metrics = {
        mc: parseKMB(mcStr),
        volume5m: parseKMB(volumeStr),
        buys,
        sells,
        age,
        devHolding,
        holderCount,
        proTraders,
        snipers,
        insiders,
      };
    } else {
      // TABLE ROW PARSING: Updated span queries
      const valueSpans = el.querySelectorAll('span[style*="color"]');
      const mcStr = valueSpans[0]?.textContent || "0";
      const volumeStr = valueSpans[1]?.textContent || "0"; // Volume from 2nd span (V$)

      const txContainer = Array.from(
        el.querySelectorAll("span.text-textTertiary")
      ).find(span => span.textContent?.includes("TX"));
      const txElement =
        txContainer?.querySelector("span.text-textPrimary") ||
        txContainer?.querySelector("span");
      const totalTx = parseInt(txElement?.textContent || "0");

      const progressDiv = el.querySelector(
        ".bg-secondaryStroke.rounded-full.overflow-hidden"
      );
      const increaseDiv = progressDiv?.querySelector(
        ".bg-increase"
      ) as HTMLElement;
      const decreaseDiv = progressDiv?.querySelector(
        ".bg-decrease"
      ) as HTMLElement;
      const buysPercent = parseFloat(
        increaseDiv?.style.width.replace("%", "") || "0"
      );
      const sellsPercent = parseFloat(
        decreaseDiv?.style.width.replace("%", "") || "0"
      );

      const buys = totalTx * (buysPercent / 100);
      const sells = totalTx * (sellsPercent / 100);

      const ageSpan = el.querySelector("span.text-primaryGreen");
      const ageText = ageSpan?.textContent || "";
      let age = 0;
      if (ageText.includes("m")) age = parseInt(ageText) || 0;
      else if (ageText.includes("h")) age = (parseInt(ageText) || 0) * 60;
      else if (ageText.includes("d")) age = (parseInt(ageText) || 0) * 1440;

      const holdersIcon = Array.from(el.querySelectorAll("i")).find(i =>
        i.classList.contains("ri-group-line")
      );
      const holdersSpan = holdersIcon?.closest(".flex")?.querySelector("span");
      const holderCount = parseInt(holdersSpan?.textContent || "0");

      const proIcon = Array.from(el.querySelectorAll("i")).find(i =>
        i.classList.contains("icon-pro-trader")
      );
      const proSpan = proIcon?.closest(".flex")?.querySelector("span");
      const proTraders = parseInt(proSpan?.textContent || "0");

      const devIcon = Array.from(el.querySelectorAll("i")).find(i =>
        i.classList.contains("ri-user-star-line")
      );
      const devSpan = devIcon?.parentElement?.querySelector(
        "span.text-primaryRed"
      );
      const devHolding = parseFloat(
        devSpan?.textContent?.replace("%", "") || "0"
      );

      const snipersIcon = Array.from(el.querySelectorAll("i")).find(i =>
        i.classList.contains("ri-crosshair-2-line")
      );
      const snipersSpan = snipersIcon?.parentElement?.querySelector(
        "span.text-primaryGreen, span.text-primaryRed"
      );
      const snipers = parseFloat(
        snipersSpan?.textContent?.replace("%", "") || "0"
      );

      const insidersIcon = Array.from(el.querySelectorAll("i")).find(i =>
        i.classList.contains("ri-ghost-line")
      );
      const insidersSpan = insidersIcon?.parentElement?.querySelector(
        "span.text-primaryGreen, span.text-primaryRed"
      );
      const insiders = parseFloat(
        insidersSpan?.textContent?.replace("%", "") || "0"
      );

      metrics = {
        mc: parseKMB(mcStr),
        volume5m: parseKMB(volumeStr),
        buys,
        sells,
        age,
        devHolding,
        holderCount,
        proTraders,
        snipers,
        insiders,
      };
    }

    // Classify & Highlight
    const classification = classifyToken(metrics, thresholds);

    highlightElement(el, classification);

    el.dataset.thProcessed = "true";
  }
};
