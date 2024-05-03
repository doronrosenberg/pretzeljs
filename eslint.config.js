import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from 'typescript-eslint';
import { defineFlatConfig } from "eslint-define-config";

export default defineFlatConfig([
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: [
      "**/dist/*",
      "**/*.cjs"
    ]
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
    }
  }
]);
