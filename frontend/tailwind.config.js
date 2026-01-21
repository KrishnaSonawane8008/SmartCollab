export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
        fontFamily: {
            Inter: ['Inter', 'system-ui', 'sans-serif'],
            PacificoRegular: ['PacificoRegular', 'system-ui', 'sans-serif'],
            Jersey10Regular: ['Jersey10Regular', 'system-ui', 'sans-serif'],
            PoppinsRegular: ['PoppinsRegular', 'system-ui', 'sans-serif'],
        },

    },
  },
  plugins: [
    require("tailwind-scrollbar"),
  ],
};