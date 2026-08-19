/**
 * AI-Recruit360 Centralized Design Tokens
 */

export const colors = {
  background: {
    primary: "#08090B",
    secondary: "#0D0F12",
    surface: "#12151A",
    elevated: "#171B21",
  },
  border: {
    default: "#242932",
    subtle: "#1C212A",
    focus: "#39D9FF",
  },
  text: {
    primary: "#F5F7FA",
    secondary: "#A7AFBC",
    muted: "#68717E",
  },
  accent: {
    ai: "#39D9FF",
    bright: "#63E3FF",
  },
  status: {
    success: "#35D07F",
    warning: "#F5B942",
    danger: "#FF5C67",
  },
} as const;

export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem",  // 8px
  md: "1rem",    // 16px
  lg: "1.5rem",  // 24px
  xl: "2rem",    // 32px
  "2xl": "3rem", // 48px
} as const;

export const radii = {
  none: "0px",
  xs: "0.25rem", // 4px
  sm: "0.375rem",// 6px
  md: "0.5rem",  // 8px
  lg: "0.75rem", // 12px
  xl: "1rem",    // 16px
  full: "9999px",
} as const;

export const typography = {
  fontFamily: {
    sans: "var(--font-inter), system-ui, sans-serif",
    display: "var(--font-geist-sans), system-ui, sans-serif",
    mono: "var(--font-geist-mono), monospace",
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],      // 12px
    sm: ["0.875rem", { lineHeight: "1.25rem" }],  // 14px
    base: ["1rem", { lineHeight: "1.5rem" }],     // 16px
    lg: ["1.125rem", { lineHeight: "1.75rem" }],  // 18px
    xl: ["1.25rem", { lineHeight: "1.75rem" }],   // 20px
    "2xl": ["1.5rem", { lineHeight: "2rem" }],    // 24px
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }],// 30px
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

export const transitions = {
  micro: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  component: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
  page: "350ms cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalOverlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;
