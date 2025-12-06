chrome.runtime.onInstalled.addListener(() => {
  console.log("Token Highlighter: Installed");

  // Initialize default storage
  chrome.storage.sync.set({
    enabled: true,
    riskLevel: "medium",
    colors: {
      risky: "#ff4444",
      pumpable: "#00ff88",
    },
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(tabId);
  if (changeInfo.status === "complete" && tab.url) {
    // Future expansion: Inject script manually if content_script fails
  }
});
