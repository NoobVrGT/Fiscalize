import { useTheme } from "./theme";

/**
 * Chart palettes are brand-hued variants tuned for data visualization and
 * validated for CVD separation, lightness band, chroma, and surface contrast
 * (per-mode). Raw brand colors are kept for UI chrome, not chart marks.
 */
export const CHART_COLORS = {
  light: {
    emerald: "#1E9E55",
    blue: "#3F6FAE",
    gold: "#C08A1E",
    grid: "#e2e8f0",
    axis: "#5f88b1",
    tooltipBg: "#ffffff",
    tooltipText: "#162c49",
  },
  dark: {
    emerald: "#1FA75B",
    blue: "#4E7FD0",
    gold: "#B98A1D",
    grid: "#1e3a5f",
    axis: "#8daccc",
    tooltipBg: "#162c49",
    tooltipText: "#dce6f1",
  },
} as const;

export function useChartColors() {
  const { theme } = useTheme();
  return CHART_COLORS[theme];
}
