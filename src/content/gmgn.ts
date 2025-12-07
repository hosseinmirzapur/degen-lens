// import { parseKMB } from "./utils";
// import { classifyToken, type Thresholds } from "./rules";
// import { highlightElement } from "./highlighter";

// // --- Configuration: DOM Selectors ---
// /**
//  * DOM selectors for locating table elements.
//  * Update these if the target website's (GMGN) structure changes.
//  */
// const SELECTORS = {
//   // General selector for a table row (e.g., div row or traditional tr)
//   ROW: "div.g-table-body div[data-index]",
//   // Attribute used to prevent re-processing the same row
//   PROCESSED_ATTR: "data-th-processed",
// };

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

// /**
//  * Parses and processes rows on the GMGN table to classify and highlight tokens.
//  *
//  * It iterates through unprocessed rows, extracts key metrics (MC, Liquidity),
//  * classifies the token based on these metrics, and highlights the row accordingly.
//  */
// export const parseGMGN = async (): Promise<void> => {
//   // Load thresholds from storage
//   const thresholds = {
//     ...defaultThresholds,
//     ...(await chrome.storage.sync.get(Object.keys(defaultThresholds))),
//   };
//   // 1. Query all rows that have *not* been processed yet
//   const unprocessedRows = document.querySelectorAll(
//     `${SELECTORS.ROW}:not([${SELECTORS.PROCESSED_ATTR}])`
//   );

//   unprocessedRows.forEach(row => {
//     // Cast the element to HTMLElement for property access (e.g., dataset)
//     const rowElement = row as HTMLElement;

//     // Get the main content div of the row
//     const rowContent = rowElement.querySelector(
//       "div.relative.flex.items-center.px-12px.flex-1.gap-8px.overflow-hidden.w-full.text-sm.cursor-pointer"
//     ) as HTMLElement;
//     if (!rowContent) return;

//     // Find MC value
//     const mcLabel = Array.from(rowContent.querySelectorAll("span")).find(
//       span => span.textContent?.trim() === "MC"
//     );
//     const mcText =
//       mcLabel?.nextElementSibling?.querySelector("span")?.textContent?.trim() ??
//       "0";

//     // Find Volume (V) as liquidity proxy
//     const liqLabel = Array.from(rowContent.querySelectorAll("span")).find(
//       span => span.textContent?.trim() === "V"
//     );
//     const liqText =
//       liqLabel?.nextElementSibling
//         ?.querySelector("span")
//         ?.textContent?.trim() ?? "0";

//     // 2. Build Metrics Object
//     const metrics = {
//       // Convert K/M/B string formats to actual numeric values
//       mc: parseKMB(mcText),
//       liquidity: parseKMB(liqText),
//       buys: 0, // Not available in GMGN
//       sells: 0,
//     };

//     // 3. Classify Token
//     const classification = classifyToken(metrics, thresholds);

//     // 4. Highlight or Mark as Processed
//     if (classification !== "neutral") {
//       // Only highlight non-neutral classifications
//       highlightElement(rowContent, classification);
//       // It's often still useful to mark highlighted rows as processed to prevent re-runs
//       rowElement.dataset.thProcessed = "true";
//     } else {
//       // Mark neutral rows as processed to skip them on subsequent runs
//       rowElement.dataset.thProcessed = "true";
//     }
//   });
// };
