import { parseKMB } from "./utils";
import { classifyToken, type Thresholds } from "./rules";
import { highlightElement } from "./highlighter";

const AXIOM_ROW = ".group.relative"; // Selector for Axiom coin rows

const defaultThresholds: Thresholds = {
  pumpMinMc: 5000,
  pumpMaxMc: 100000,
  pumpMinLiq: 5000,
  pumpBuySellRatio: 2,
  riskMaxLiq: 1000,
  riskSellBuyRatio: 3,
  stableMinMc: 1000000,
  stableMinLiq: 100000,
};

export const parseAxiom = async () => {
  // Load thresholds from storage
  const thresholds = {
    ...defaultThresholds,
    ...(await chrome.storage.sync.get(Object.keys(defaultThresholds))),
  };
  const rows = document.querySelectorAll(
    `${AXIOM_ROW}:not([data-th-processed])`
  );

  rows.forEach(row => {
    const el = row as HTMLElement;

    // Extract market cap and volume from colored spans
    const valueSpans = el.querySelectorAll('span[style*="color"]');
    const mcStr = valueSpans[0]?.textContent || "0";
    const liquidityStr = valueSpans[1]?.textContent || "0";

    // Extract total transactions
    const txContainer = Array.from(
      el.querySelectorAll("span.text-textTertiary")
    ).find(span => span.textContent?.includes("TX"));
    const txElement = txContainer?.querySelector("span.text-textPrimary");
    const totalTx = parseInt(txElement?.textContent || "0");

    // Extract buy/sell percentages from progress bar
    const progressDiv = el.querySelector(
      ".bg-secondaryStroke.rounded-full.overflow-hidden"
    );
    const increaseDiv = progressDiv?.querySelector(
      ".bg-increase"
    ) as HTMLElement;
    const decreaseDiv = progressDiv?.querySelector(
      ".bg-decrease"
    ) as HTMLElement;
    const buysPercent = parseFloat(increaseDiv?.style.width || "0");
    const sellsPercent = parseFloat(decreaseDiv?.style.width || "0");

    // Calculate buys and sells as approximate counts
    const buys = totalTx * (buysPercent / 100);
    const sells = totalTx * (sellsPercent / 100);

    const metrics = {
      mc: parseKMB(mcStr),
      liquidity: parseKMB(liquidityStr),
      buys,
      sells,
    };

    const classification = classifyToken(metrics, thresholds);

    if (classification !== "neutral") {
      highlightElement(el, classification);
    } else {
      el.dataset.thProcessed = "true";
    }
  });
};
