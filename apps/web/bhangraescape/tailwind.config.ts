import daisyui from "daisyui";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}", "./src/pages/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [daisyui, forms],
  daisyui: { themes: ["cupcake"] },
};

export default config;