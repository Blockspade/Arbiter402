/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hedera: "#00E887",
        thegraph: "#6f4cff",
        bazantic: "#FF6B00",
      },
    },
  },
  plugins: [],
};
