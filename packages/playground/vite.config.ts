import { defineConfig } from "vite";
import * as path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@pretzeljs/pretzeljs": path.resolve(
        __dirname,
        "../pretzeljs/src/index.ts",
      ),
    },
  },
});
