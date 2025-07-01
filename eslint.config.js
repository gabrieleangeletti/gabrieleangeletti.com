import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import pluginImport from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import pluginAstro from "eslint-plugin-astro";

export default [
  {
    ignores: [
      "dist",
      ".astro",
      "eslint.config.js",
      "tailwind.config.js",
      "vite.config.ts",
      "astro.config.mjs",
    ],
  },
  ...pluginAstro.configs.recommended,
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: pluginAstro.parser,
      parserOptions: {
        extraFileExtensions: [".astro"],
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...pluginAstro.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: pluginReact,
      "@typescript-eslint": tseslint.plugin,
      "react-hooks": pluginReactHooks,
      "jsx-a11y": pluginJsxA11y,
      import: pluginImport,
      prettier: prettier,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginJsxA11y.configs.recommended.rules,
      ...pluginImport.configs.recommended.rules,
      ...prettierConfig.rules,
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
  {
    files: ["*.config.js", "*.config.ts", "vite.config.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },
];
