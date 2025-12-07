chrome.runtime.onInstalled.addListener(() => {
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

chrome.tabs.onUpdated.addListener((_, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    // Future expansion: Inject script manually if content_script fails
  }
});
