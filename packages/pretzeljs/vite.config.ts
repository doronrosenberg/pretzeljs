import { defineConfig } from "vite";
import { resolve } from "node:url";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "/src/index.ts"),
      name: "PretzelJS",
      fileName: "pretzeljs",
    },
  },
  plugins: [dts()],
});
