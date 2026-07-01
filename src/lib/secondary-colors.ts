export interface SecondaryColor {
  name: string;
  value: string;
  darkValue: string;
}

export const SECONDARY_COLORS: SecondaryColor[] = [
  { name: "Gray", value: "oklch(0.96 0 0)", darkValue: "oklch(0.22 0 0)" },
  { name: "Green", value: "oklch(0.96 0.02 140)", darkValue: "oklch(0.28 0.02 260)" },
  { name: "Blue", value: "oklch(0.96 0.02 240)", darkValue: "oklch(0.28 0.02 260)" },
  { name: "Purple", value: "oklch(0.96 0.02 290)", darkValue: "oklch(0.28 0.02 290)" },
  { name: "Orange", value: "oklch(0.96 0.02 50)", darkValue: "oklch(0.28 0.02 50)" },
  { name: "Rose", value: "oklch(0.96 0.02 340)", darkValue: "oklch(0.28 0.02 340)" },
];

export function applyColorToRoot(color: SecondaryColor, isDark: boolean): void {
  const root = document.documentElement;
  root.style.setProperty("--secondary", isDark ? color.darkValue : color.value);
  root.style.setProperty("--secondary-foreground", isDark ? "oklch(0.98 0 0)" : "oklch(0.22 0.02 260)");
}
