import globals from "globals";
import pluginJs from "@eslint/js";
import importPlugin from 'eslint-plugin-import';
import tsEslint from "typescript-eslint";

// noinspection JSUnusedGlobalSymbols
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"]
  },
  {
    languageOptions: { globals: globals.browser }
  },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommendedTypeChecked,
  importPlugin.flatConfigs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js'],
          defaultProject: 'tsconfig.json',
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    settings: {
      // from guidance here: https://github.com/import-js/eslint-plugin-import?tab=readme-ov-file#typescript
      "import/resolver": {
        // You will also need to install and configure the TypeScript resolver
        // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
        "typescript": true,
        "node": true,
      },
    },
    rules: {
      "eqeqeq": ["error", "always", {"null": "ignore"}],
      "no-duplicate-imports": "error",
      "object-shorthand": ["error", "always"],
      "@typescript-eslint/no-deprecated": "error",
    }
    },
];