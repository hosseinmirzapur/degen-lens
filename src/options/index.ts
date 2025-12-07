const saveBtn = document.getElementById("save") as HTMLButtonElement;
const resetBtn = document.getElementById("reset") as HTMLButtonElement;
const statusSpan = document.getElementById("status") as HTMLSpanElement;
const form = document.getElementById("settingsForm") as HTMLFormElement;
const tabButtons = document.querySelectorAll(
  ".tab-button"
) as NodeListOf<HTMLButtonElement>;
const tabContents = document.querySelectorAll(
  ".tab-content"
) as NodeListOf<HTMLDivElement>;

// Inputs
const enabledCheck = document.getElementById("enabled") as HTMLInputElement;

const sections = ["newPairs", "finalStretch", "migrated"];
const thresholdKeys = [
  "pumpMinMc",
  "pumpMaxMc",
  "pumpMinLiq",
  "pumpBuySellRatio",
  "riskMaxLiq",
  "riskSellBuyRatio",
  "stableMinMc",
  "stableMinLiq",
  "maxAge",
  "maxDevHolding",
  "minHolders",
  "minProTraders",
  "maxSnipers",
  "maxInsiders",
];

const inputs: Record<string, HTMLInputElement> = {};

sections.forEach(section => {
  thresholdKeys.forEach(key => {
    const id = `${section}_${key}`;
    inputs[id] = document.getElementById(id) as HTMLInputElement;
  });
});

// Default values per section
const sectionDefaults = {
  newPairs: {
    pumpMinMc: 7000,
    pumpMaxMc: 50000,
    pumpMinLiq: 1000,
    pumpBuySellRatio: 1.5,
    riskMaxLiq: 500,
    riskSellBuyRatio: 3,
    stableMinMc: 500000,
    stableMinLiq: 50000,
    maxAge: 3,
    maxDevHolding: 9,
  },
  finalStretch: {
    pumpMinMc: 8000,
    pumpMaxMc: 75000,
    pumpMinLiq: 3000,
    pumpBuySellRatio: 1.8,
    riskMaxLiq: 750,
    riskSellBuyRatio: 3,
    stableMinMc: 750000,
    stableMinLiq: 75000,
    maxAge: 40,
    maxDevHolding: 10,
    minProTraders: 10,
    maxSnipers: 40,
    maxInsiders: 30,
  },
  migrated: {
    pumpMinMc: 20000,
    pumpMaxMc: 150000,
    pumpMinLiq: 10000,
    pumpBuySellRatio: 2.5,
    riskMaxLiq: 1500,
    riskSellBuyRatio: 3,
    stableMinMc: 1500000,
    stableMinLiq: 150000,
    minHolders: 50,
    minProTraders: 50,
  },
};

const defaults = {
  enabled: true,
  ...sectionDefaults.newPairs,
  ...sectionDefaults.finalStretch,
  ...sectionDefaults.migrated,
};

// Tab switching
tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    tabButtons.forEach(btn => btn.classList.remove("active"));
    tabContents.forEach(content => content.classList.remove("active"));
    button.classList.add("active");
    const tabId = button.getAttribute("data-tab");
    const tabContent = document.getElementById(`${tabId}Tab`) as HTMLDivElement;
    tabContent.classList.add("active");
  });
});

// Load Settings
chrome.storage.sync.get(Object.keys(defaults), items => {
  enabledCheck.checked = items.enabled ?? defaults.enabled;

  sections.forEach(section => {
    thresholdKeys.forEach(key => {
      const id = `${section}_${key}`;
      const sectionDef = sectionDefaults[
        section as keyof typeof sectionDefaults
      ] as any;
      const defaultValue = sectionDef[key] ?? "";
      const value = items[id] ?? defaultValue;
      inputs[id].value = value;
    });
  });
});

// Save Settings
form.addEventListener("submit", e => {
  e.preventDefault();
  const settings: any = { enabled: enabledCheck.checked };

  sections.forEach(section => {
    thresholdKeys.forEach(key => {
      const id = `${section}_${key}`;
      settings[id] = Number(inputs[id].value);
    });
  });

  chrome.storage.sync.set(settings, () => {
    statusSpan.textContent = "Settings saved successfully!";
    statusSpan.classList.add("show");
    setTimeout(() => {
      statusSpan.textContent = "";
      statusSpan.classList.remove("show");
    }, 3000);
  });
});

// Reset to Defaults
resetBtn.addEventListener("click", () => {
  enabledCheck.checked = defaults.enabled;

  sections.forEach(section => {
    thresholdKeys.forEach(key => {
      const id = `${section}_${key}`;
      const sectionDef = sectionDefaults[
        section as keyof typeof sectionDefaults
      ] as any;
      const value = sectionDef[key] ?? "";
      inputs[id].value = value.toString();
    });
  });

  chrome.storage.sync.set(defaults, () => {
    statusSpan.textContent = "Reset to defaults!";
    statusSpan.classList.add("show");
    setTimeout(() => {
      statusSpan.textContent = "";
      statusSpan.classList.remove("show");
    }, 3000);
  });
});
