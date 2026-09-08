import { useEffect, useState } from "react";

/**
 * Suit la préférence de thème du système (prefers-color-scheme).
 * Nécessaire uniquement pour ce que le CSS ne peut pas adapter tout seul,
 * comme les couleurs dessinées sur un <canvas> par Chart.js.
 */
export function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isDark;
}

/**
 * Palette partagée pour les graphiques Chart.js : ils dessinent sur un
 * <canvas> et ne peuvent donc pas lire les variables CSS du thème, il faut
 * leur fournir des couleurs littérales selon le mode clair/sombre.
 */
export function chartPalette(isDark: boolean) {
  return {
    grid: isDark ? "#20242f" : "#eef0f3",
    axisLine: isDark ? "#262b35" : "#e5e7eb",
    tick: isDark ? "#8a93a6" : "#9ca3af",
    tooltipBg: isDark ? "#1c212b" : "#0f172a",
    surface: isDark ? "#14171f" : "#ffffff",
  };
}
