import js from "@eslint/js";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "*.config.js",
      "*.config.mjs"
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],

    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },

    plugins: {
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
    },

    rules: {
      /*
      -------------------------
      IMPORT MANAGEMENT
      -------------------------
      */

      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      "unused-imports/no-unused-imports": "error",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      /*
      -------------------------
      TYPESCRIPT RULES
      -------------------------
      */

      "@typescript-eslint/no-explicit-any": "warn",

      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
        },
      ],

      /*
      -------------------------
      NESTJS FRIENDLY RULES
      -------------------------
      */

      "@typescript-eslint/ban-ts-comment": "warn",

      /*
      DTOs and decorators often require empty constructors
      */

      "@typescript-eslint/no-empty-function": "off",

      /*
      Allow classes for Nest providers
      */

      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
  prettier,
];