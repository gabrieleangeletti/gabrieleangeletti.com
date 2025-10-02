import { useEffect, useState } from "react";

export interface ChartThemeColors {
  axisColor: string;
  tooltipBackground: string;
  tooltipBorder: string;
  tooltipText: string;
}

const FALLBACK_THEME: ChartThemeColors = {
  axisColor: "#1f2937",
  tooltipBackground: "#ffffff",
  tooltipBorder: "rgba(15, 23, 42, 0.15)",
  tooltipText: "#1f2937",
};

const readThemeFromCSS = (): ChartThemeColors => {
  if (typeof window === "undefined") {
    return FALLBACK_THEME;
  }

  const rootStyles = getComputedStyle(document.documentElement);
  const bodyStyles = getComputedStyle(document.body);
  const baseContent = rootStyles.getPropertyValue("--bc").trim();
  const baseBackground = rootStyles.getPropertyValue("--b1").trim();

  const bodyTextColor = bodyStyles.color?.trim();
  const bodyBackgroundColor = bodyStyles.backgroundColor?.trim();

  const axisColor =
    bodyTextColor || (baseContent ? `hsl(${baseContent})` : FALLBACK_THEME.axisColor);

  let tooltipBackground = FALLBACK_THEME.tooltipBackground;
  if (baseBackground) {
    tooltipBackground = `hsl(${baseBackground})`;
  }
  if (bodyBackgroundColor && bodyBackgroundColor !== "rgba(0, 0, 0, 0)") {
    tooltipBackground = bodyBackgroundColor;
  }

  return {
    axisColor,
    tooltipBackground,
    tooltipBorder: axisColor,
    tooltipText: axisColor,
  };
};

const useChartTheme = (): ChartThemeColors => {
  const [theme, setTheme] = useState<ChartThemeColors>(() => readThemeFromCSS());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateTheme = () => {
      setTheme(readThemeFromCSS());
    };

    updateTheme();

    const observer = new MutationObserver(() => updateTheme());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => updateTheme();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleMediaChange);
    } else if (typeof media.addListener === "function") {
      media.addListener(handleMediaChange);
    }

    return () => {
      observer.disconnect();
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", handleMediaChange);
      } else if (typeof media.removeListener === "function") {
        media.removeListener(handleMediaChange);
      }
    };
  }, []);

  return theme;
};

export default useChartTheme;
