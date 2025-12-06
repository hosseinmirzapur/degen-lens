import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

// Plugin to copy manifest and icons
const copyAssets = () => {
  return {
    name: "copy-assets",
    closeBundle: () => {
      const dest = resolve(__dirname, "dist");
      if (!fs.existsSync(dest)) fs.mkdirSync(dest);
      fs.copyFileSync("manifest.json", resolve(dest, "manifest.json"));
      // Ensure public folder exists or copy icons manually if needed
    },
  };
};

export default defineConfig({
  plugins: [copyAssets()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content/index.ts"),
        background: resolve(__dirname, "src/background/index.ts"),
        options: resolve(__dirname, "src/options/index.html"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
