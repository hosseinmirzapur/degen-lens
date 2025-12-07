// content/index.ts — Simplified: No pulse split, enhanced retry/logs

import { injectStyles } from "./highlighter";
import { parseAxiom } from "./axiom";
import { parseGMGN } from "./gmgn";

const init = async () => {
  injectStyles();

  const settings = await chrome.storage.sync.get(["enabled"]);
  if (!settings.enabled) return;

  let parser: () => Promise<void>;

  if (window.location.hostname.includes("axiom")) {
    parser = parseAxiom;
  } else if (window.location.hostname.includes("gmgn")) {
    parser = parseGMGN;
  } else {
    return; // No supported site
  }

  const runParsers = async () => {
    try {
      await parser();
    } catch (e) {
      console.error("[Degen-Lens] Parse Error:", e);
    }
  };

  // Initial run
  await runParsers();

  // use Observer for less CPU usage
  const observer = new MutationObserver(runParsers);
  const targetNode = document.body;
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
    attributes: true,
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
