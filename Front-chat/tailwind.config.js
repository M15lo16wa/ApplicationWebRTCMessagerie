export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-tint": "var(--color-primary-tint)",
        accent: "var(--color-accent)",
        success: "var(--color-success)",
        danger: "var(--color-danger)",
        app: "var(--color-app-bg)",
        surface: "var(--color-surface)",
        "chat-bg": "var(--color-chat-bg)",
        ink: "var(--color-ink)",
        "ink-soft": "var(--color-ink-soft)",
        line: "var(--color-line)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
