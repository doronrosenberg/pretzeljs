import { defineConfig } from 'vite'
import {resolve} from "node:url";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "/src/index.ts"),
      name: "PretzelJS"
    }
  }
})