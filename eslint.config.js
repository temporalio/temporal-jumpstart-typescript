import globals from "globals";
import pluginJs from "@eslint/js";
import importPlugin from 'eslint-plugin-import';
import tsEslint from "typescript-eslint";

// import esImport from 'eslint-plugin-import';
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"]
  },
  {
    languageOptions: { globals: globals.browser }
  },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  {
    settings: {
      "import/resolver": {
        // You will also need to install and configure the TypeScript resolver
        // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
        "typescript": true,
        "node": true,
      },
    }
    },
];