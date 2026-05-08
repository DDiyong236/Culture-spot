import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF7F0",
        primary: "#6B4F3F",
        accent: "#D99A3D",
        ink: "#2F2F2F",
        sage: "#7A8C6A",
        card: "#FFFFFF",
        line: "#E5DED4",
        clay: "#B9785F",
        mist: "#ECE7DD",
      },
      boxShadow: {
        warm: "0 14px 40px rgba(107, 79, 63, 0.10)",
        soft: "0 8px 24px rgba(47, 47, 47, 0.08)",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
