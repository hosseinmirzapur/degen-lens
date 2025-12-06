import { Classification } from "./rules";

const STYLES_ID = "th-styles";

export const injectStyles = () => {
  if (document.getElementById(STYLES_ID)) return;
  const style = document.createElement("style");
  style.id = STYLES_ID;
  style.textContent = `
    .th-highlight { transition: all 0.3s ease; position: relative; z-index: 10; }
    .th-risky { background: linear-gradient(135deg, rgba(255, 68, 68, 0.15), rgba(255, 68, 68, 0.25)) !important; box-shadow: 0 0 15px rgba(255, 68, 68, 0.3) !important; }
    .th-pumpable { background: linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 255, 136, 0.25)) !important; box-shadow: 0 0 15px rgba(0, 255, 136, 0.3) !important; }
    .th-stable { background: linear-gradient(135deg, rgba(68, 136, 255, 0.15), rgba(68, 136, 255, 0.25)) !important; box-shadow: 0 0 15px rgba(68, 136, 255, 0.3) !important; }
  `;
  document.head.appendChild(style);
};

export const highlightElement = (el: HTMLElement, type: Classification) => {
  if (type === "neutral") return;

  // Prevent double highlighting
  if (el.dataset.thProcessed) return;

  el.classList.add("th-highlight", `th-${type}`);
  el.dataset.thProcessed = "true";
};

export const clearHighlights = () => {
  // Optional: Implementation for clearing if user toggles off
  document.querySelectorAll(".th-highlight").forEach(el => {
    el.classList.remove("th-highlight", "th-risky", "th-pumpable", "th-stable");
    delete (el as HTMLElement).dataset.thProcessed;
  });
};
