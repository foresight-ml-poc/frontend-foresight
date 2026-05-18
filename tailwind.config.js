/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#070a0f",
          900: "#0b0f17",
          800: "#11161f",
          700: "#1a212d",
          600: "#252e3d",
        },
        mint: {
          DEFAULT: "#0BE0A6",
          dim: "#0a9e78",
        },
        ink: {
          DEFAULT: "#e7edf5",
          muted: "#9aa7b8",
          dim: "#5c6878",
        },
        loss: "#f76d6d",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
