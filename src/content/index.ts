// content/index.ts — Simplified: No pulse split, enhanced retry/logs

import { injectStyles } from "./highlighter";
import { parseAxiom } from "./axiom";

const init = async () => {
  injectStyles();

  if (!window.location.hostname.includes("axiom")) return;

  const settings = await chrome.storage.sync.get(["enabled"]);
  if (!settings.enabled) return;

  const runParsers = async () => {
    try {
      await parseAxiom();
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
