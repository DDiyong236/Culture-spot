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
        primary: "#F37338",
        accent: "#F37338",
        ink: "#2F2F2F",
        sage: "#7A8C6A",
        card: "#FFFFFF",
        line: "#E5DED4",
        clay: "#F37338",
        mist: "#ECE7DD",
      },
      boxShadow: {
        warm: "0 14px 40px rgba(243, 115, 56, 0.14)",
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
