import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // SLUSHPILE_URL is read in exactly one place — lib/site/env.ts — so the
  // rewrite, the nav slot, and any future consumer all observe the same
  // state. Reading process.env.SLUSHPILE_URL anywhere else fragments the gate.
  {
    files: ["**/*.{ts,tsx,js,mjs,cjs}"],
    // e2e specs read SLUSHPILE_URL directly to branch their assertions —
    // they observe app state, they don't consume the gate.
    ignores: ["lib/site/env.ts", "e2e/**/*.spec.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.object.name='process'][object.property.name='env'][property.name='SLUSHPILE_URL']",
          message:
            "Read SLUSHPILE_URL via lib/site/env.ts so the rewrite and nav slot agree on flag state.",
        },
      ],
    },
  },
]);

export default eslintConfig;
