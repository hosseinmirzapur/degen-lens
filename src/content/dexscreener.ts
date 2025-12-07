// import { parseKMB } from "./utils";
// import { classifyToken, type Thresholds } from "./rules";
// import { highlightElement, injectStyles } from "./highlighter";

// // 1. SELECTORS
// // The main container for a single token pair row is the <a> tag
// const DEXSCREENER_ROW_SELECTOR = "a.ds-dex-table-row";

// const defaultThresholds: Thresholds = {
//   pumpMinMc: 5000,
//   pumpMaxMc: 100000,
//   pumpMinLiq: 5000,
//   pumpBuySellRatio: 2,
//   riskMaxLiq: 1000,
//   riskSellBuyRatio: 3,
//   stableMinMc: 1000000,
//   stableMinLiq: 100000,
// };

// // Specific column selectors (relative to the ROW_SELECTOR)
// // The HTML uses specific classes for each column, which is ideal.
// const COL_VOLUME = ".ds-dex-table-row-col-volume";
// const COL_LIQUIDITY = ".ds-dex-table-row-col-liquidity";
// const COL_MCAP = ".ds-dex-table-row-col-market-cap";
// const COL_TXNS = ".ds-dex-table-row-col-txns"; // Used for buy/sell estimate (Total Txns)

// /**
//  * Parses the Dexscreener data table, extracts metrics, classifies, and highlights.
//  */
// export const parseDexscreener = async () => {
//   // Ensure styles are injected first
//   injectStyles();

//   // Load thresholds from storage
//   const thresholds = {
//     ...defaultThresholds,
//     ...(await chrome.storage.sync.get(Object.keys(defaultThresholds))),
//   };

//   // Find all rows that haven't been processed
//   const rows = document.querySelectorAll(
//     `${DEXSCREENER_ROW_SELECTOR}:not([data-th-processed])`
//   );

//   rows.forEach(row => {
//     const el = row as HTMLElement;

//     try {
//       // --- 2. EXTRACTION LOGIC ---

//       // Extract raw text content from the relevant columns
//       const volumeText = el.querySelector(COL_VOLUME)?.textContent || "$0";
//       const liqText = el.querySelector(COL_LIQUIDITY)?.textContent || "$0";
//       const mcText = el.querySelector(COL_MCAP)?.textContent || "$0";
//       // We will use Total Txns as a proxy for activity if we can't separate Buys/Sells
//       const txnsText =
//         el.querySelector(COL_TXNS)?.textContent?.replace(/,/g, "") || "0";

//       // --- 3. BUILD METRICS OBJECT ---
//       const metrics = {
//         // Use parseKMB to clean and convert values like $8.5M, $430K
//         mc: parseKMB(mcText),
//         liquidity: parseKMB(liqText),
//         volume10m: parseKMB(volumeText), // Using Volume for generic volume check

//         // Dexscreener HTML only gives total Txns. We'll use a placeholder
//         // or the total Txns for a rough activity check if your rules need it.
//         // Since your rules currently use 'buys' and 'sells', we'll set them
//         // to a basic proxy value (e.g., total transactions / 2) if you cannot
//         // get the granular data from the row, or default to 0 for safety.
//         // NOTE: Dexscreener rows don't expose 5m Buys/Sells count directly in this view.
//         // We will default to 0 for buys/sells for safety, which means rules relying on
//         // buy/sell pressure will default to 'neutral' unless modified.
//         // For demonstration, let's use total Txns as an activity metric:
//         buys: parseInt(txnsText) / 2 || 0,
//         sells: parseInt(txnsText) / 2 || 0,
//       };

//       // --- 4. CLASSIFY & HIGHLIGHT ---
//       const classification = classifyToken(metrics, thresholds);

//       if (classification !== "neutral") {
//         highlightElement(el, classification);
//       } else {
//         // Mark neutral so we don't re-parse constantly
//         el.dataset.thProcessed = "true";
//       }
//     } catch (error) {
//       console.error("Error processing Dexscreener row:", error, el);
//       // Mark as processed to skip future errors on this element
//       el.dataset.thProcessed = "error";
//     }
//   });
// };
