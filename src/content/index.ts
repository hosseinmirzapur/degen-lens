import { injectStyles } from "./highlighter";
// import { parseGMGN } from "./gmgn";
import { parseAxiom } from "./axiom";
// import { parseDexscreener } from "./dexscreener";

console.log("Token Highlighter: Injected");

const detectPlatform = () => {
  const host = window.location.hostname;
  //   if (host.includes("gmgn")) return "gmgn";
  if (host.includes("axiom")) return "axiom";
  //   if (host.includes("dexscreener")) return "dexscreener";
  return null;
};

const init = async () => {
  injectStyles();
  const platform = detectPlatform();

  if (!platform) return;

  // Check if extension is enabled
  const settings = await chrome.storage.sync.get(["enabled"]);
  if (!settings.enabled) return;

  console.log(`Token Highlighter: Active on ${platform}`);

  const runParsers = async () => {
    try {
      //   if (platform === "gmgn") await parseGMGN();
      if (platform === "axiom") await parseAxiom();
      //   if (platform === "dexscreener") await parseDexscreener();
    } catch (e) {
      console.error("Parse Loop Error:", e);
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
  });
};

// Start
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
