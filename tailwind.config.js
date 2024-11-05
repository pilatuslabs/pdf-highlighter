/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}" , "./example/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      transitionProperty:{
        'background' : "background"
      }
    },
  },
  plugins: [],
}

