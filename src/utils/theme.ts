import { useApp } from "../store";

/**
 * Thème effectif (système ou choisi explicitement via le sélecteur de
 * thème). Nécessaire uniquement pour ce que le CSS ne peut pas adapter tout
 * seul, comme les couleurs dessinées sur un <canvas> par Chart.js — pour
 * tout le reste, les variables de couleur d'index.css suffisent.
 */
export function useIsDarkMode(): boolean {
  return useApp().isDark;
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
