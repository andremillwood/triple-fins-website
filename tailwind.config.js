/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        deep: "#0B2E4E",
        deep2: "#07223A",
        ink: "#06202F",
        aqua: "#15D2DB",
        "aqua-deep": "#0F8BBF",
        wave: "#16B3C9",
        sun: "#FFB020",
        coral: "#FF5A5F",
        foam: "#EAF4F6",
        paper: "#FFFFFF",
        muted: "#5D7688",
        line: "#D8E6EB",
      },
      fontFamily: {
        display: ["var(--font-saira)", "sans-serif"],
        body: ["var(--font-figtree)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
