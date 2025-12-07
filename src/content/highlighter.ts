import { Classification } from "./rules";

// Extend the type to include neutral (this is the real fix)
type ExtendedClassification = Classification | "neutral";

const STYLES_ID = "th-styles";

export const injectStyles = () => {
  if (document.getElementById(STYLES_ID)) return;

  const style = document.createElement("style");
  style.id = STYLES_ID;
  style.textContent = `
    .th-highlight {
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
      position: relative !important;
      z-index: 10 !important;
      border-radius: 0 !important;
      overflow: hidden !important;
    }

    .th-pumpable {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.22), rgba(0, 255, 136, 0.12)) !important;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.3) !important;
      border: 1px solid rgba(0, 255, 136, 0.4) !important;
      animation: th-pulse-green 3s infinite alternate !important;
    }

    .th-risky {
      background: linear-gradient(135deg, rgba(255, 68, 68, 0.25), rgba(255, 68, 68, 0.15)) !important;
      box-shadow: 0 0 20px rgba(255, 68, 68, 0.6), 0 0 40px rgba(255, 68, 68, 0.3) !important;
      border: 1px solid rgba(255, 68, 68, 0.5) !important;
      animation: th-pulse-red 2s infinite alternate !important;
    }

    .th-stable {
      background: linear-gradient(135deg, rgba(68, 136, 255, 0.18), rgba(68, 136, 255, 0.08)) !important;
      box-shadow: 0 0 18px rgba(68, 136, 255, 0.4) !important;
      border: 1px solid rgba(68, 136, 255, 0.3) !important;
    }

    /* NEUTRAL — PURPLE SHIMMER (NOW VISIBLE) */
    .th-neutral {
      background: linear-gradient(135deg, rgba(180, 38, 255, 0.08), rgba(138, 43, 226, 0.04)) !important;
      border: 1px solid rgba(180, 38, 255, 0.25) !important;
      box-shadow: 0 0 14px rgba(180, 38, 255, 0.3) !important;
      position: relative !important;
      overflow: hidden !important;
    }

    .th-neutral::after {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 60%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(180, 38, 255, 0.18), transparent);
      animation: th-shimmer 4.5s infinite linear !important;
      pointer-events: none;
    }

    @keyframes th-pulse-green {
      from { box-shadow: 0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.3); }
      to   { box-shadow: 0 0 32px rgba(0, 255, 136, 0.7), 0 0 60px rgba(0, 255, 136, 0.4); }
    }

    @keyframes th-pulse-red {
      from { box-shadow: 0 0 20px rgba(255, 68, 68, 0.6); }
      to   { box-shadow: 0 0 32px rgba(255, 68, 68, 0.9); }
    }

    @keyframes th-shimmer {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(300%); }
    }
  `;

  document.head.appendChild(style);
};

export const highlightElement = (
  el: HTMLElement,
  type: ExtendedClassification
) => {
  if (el.dataset.thProcessed) return;

  // Always add base class
  el.classList.add("th-highlight");

  // Apply correct class — neutral now works
  switch (type) {
    case "pumpable":
      el.classList.add("th-pumpable");
      break;
    case "risky":
      el.classList.add("th-risky");
      break;
    case "stable":
      el.classList.add("th-stable");
      break;
    case "neutral":
      el.classList.add("th-neutral");
      break;
  }

  el.dataset.thProcessed = "true";
};

export const clearHighlights = () => {
  document.querySelectorAll(".th-highlight").forEach(el => {
    el.classList.remove(
      "th-highlight",
      "th-pumpable",
      "th-risky",
      "th-stable",
      "th-neutral"
    );
    delete (el as HTMLElement).dataset.thProcessed;
  });
};
