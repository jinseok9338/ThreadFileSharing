import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import languageUpdate from "./scripts/languageUpdate/languageUpdate";

const i18nConfig = {
  csvFile: "language.csv",
  support: ["ko", "en"],
  outputPath: "app/lang",
};

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    reactRouter(),
    tailwindcss(),
    languageUpdate(i18nConfig),
  ],
});
