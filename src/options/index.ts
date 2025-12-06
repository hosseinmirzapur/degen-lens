const saveBtn = document.getElementById("save") as HTMLButtonElement;
const resetBtn = document.getElementById("reset") as HTMLButtonElement;
const statusSpan = document.getElementById("status") as HTMLSpanElement;
const form = document.getElementById("settingsForm") as HTMLFormElement;

// Inputs
const enabledCheck = document.getElementById("enabled") as HTMLInputElement;
const pumpMinMcInput = document.getElementById("pumpMinMc") as HTMLInputElement;
const pumpMaxMcInput = document.getElementById("pumpMaxMc") as HTMLInputElement;
const pumpMinLiqInput = document.getElementById(
  "pumpMinLiq"
) as HTMLInputElement;
const pumpBuySellRatioInput = document.getElementById(
  "pumpBuySellRatio"
) as HTMLInputElement;
const riskMaxLiqInput = document.getElementById(
  "riskMaxLiq"
) as HTMLInputElement;
const riskSellBuyRatioInput = document.getElementById(
  "riskSellBuyRatio"
) as HTMLInputElement;
const stableMinMcInput = document.getElementById(
  "stableMinMc"
) as HTMLInputElement;
const stableMinLiqInput = document.getElementById(
  "stableMinLiq"
) as HTMLInputElement;

// Default values
const defaults = {
  enabled: true,
  pumpMinMc: 5000,
  pumpMaxMc: 100000,
  pumpMinLiq: 5000,
  pumpBuySellRatio: 2,
  riskMaxLiq: 1000,
  riskSellBuyRatio: 3,
  stableMinMc: 1000000,
  stableMinLiq: 100000,
};

// Load Settings
chrome.storage.sync.get(Object.keys(defaults), items => {
  enabledCheck.checked = items.enabled ?? defaults.enabled;
  pumpMinMcInput.value = items.pumpMinMc ?? defaults.pumpMinMc;
  pumpMaxMcInput.value = items.pumpMaxMc ?? defaults.pumpMaxMc;
  pumpMinLiqInput.value = items.pumpMinLiq ?? defaults.pumpMinLiq;
  pumpBuySellRatioInput.value =
    items.pumpBuySellRatio ?? defaults.pumpBuySellRatio;
  riskMaxLiqInput.value = items.riskMaxLiq ?? defaults.riskMaxLiq;
  riskSellBuyRatioInput.value =
    items.riskSellBuyRatio ?? defaults.riskSellBuyRatio;
  stableMinMcInput.value = items.stableMinMc ?? defaults.stableMinMc;
  stableMinLiqInput.value = items.stableMinLiq ?? defaults.stableMinLiq;
});

// Save Settings
form.addEventListener("submit", e => {
  e.preventDefault();
  chrome.storage.sync.set(
    {
      enabled: enabledCheck.checked,
      pumpMinMc: Number(pumpMinMcInput.value),
      pumpMaxMc: Number(pumpMaxMcInput.value),
      pumpMinLiq: Number(pumpMinLiqInput.value),
      pumpBuySellRatio: Number(pumpBuySellRatioInput.value),
      riskMaxLiq: Number(riskMaxLiqInput.value),
      riskSellBuyRatio: Number(riskSellBuyRatioInput.value),
      stableMinMc: Number(stableMinMcInput.value),
      stableMinLiq: Number(stableMinLiqInput.value),
    },
    () => {
      statusSpan.textContent = "Settings saved successfully!";
      statusSpan.classList.add("show");
      setTimeout(() => {
        statusSpan.textContent = "";
        statusSpan.classList.remove("show");
      }, 3000);
    }
  );
});

// Reset to Defaults
resetBtn.addEventListener("click", () => {
  enabledCheck.checked = defaults.enabled;
  pumpMinMcInput.value = defaults.pumpMinMc.toString();
  pumpMaxMcInput.value = defaults.pumpMaxMc.toString();
  pumpMinLiqInput.value = defaults.pumpMinLiq.toString();
  pumpBuySellRatioInput.value = defaults.pumpBuySellRatio.toString();
  riskMaxLiqInput.value = defaults.riskMaxLiq.toString();
  riskSellBuyRatioInput.value = defaults.riskSellBuyRatio.toString();
  stableMinMcInput.value = defaults.stableMinMc.toString();
  stableMinLiqInput.value = defaults.stableMinLiq.toString();

  chrome.storage.sync.set(defaults, () => {
    statusSpan.textContent = "Reset to defaults!";
    statusSpan.classList.add("show");
    setTimeout(() => {
      statusSpan.textContent = "";
      statusSpan.classList.remove("show");
    }, 3000);
  });
});
