import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // SLUSHPILE_URL is read in exactly one place — lib/site/env.ts — so the
  // rewrite, the nav slot, and the e2e suite all observe the same state.
  {
    files: ["**/*.{ts,tsx,js,mjs,cjs}"],
    ignores: ["lib/site/env.ts"],
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
