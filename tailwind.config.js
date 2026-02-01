module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6d28d9",
        secondary: "#2dd4bf",
        dark: "#0f172a",
        surface: "#1e293b",
      },
      keyframes: {
        heroFloat: {
          "0%, 100%": { transform: "translateY(0) rotateZ(0deg)" },
          "50%": { transform: "translateY(-20px) rotateZ(2deg)" },
        },
        codeScroll: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-300px)" },
        },
        activity: {
          "0%, 100%": { transform: "scaleY(0.25)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        heroFloat: "heroFloat 6s ease-in-out infinite",
        codeScroll: "codeScroll 15s linear infinite",
        activity: "activity 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
