import daisyui from "daisyui";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
  ],
  theme: { extend: {} },
  plugins: [daisyui, forms],
  daisyui: { themes: ["cupcake"] },
};