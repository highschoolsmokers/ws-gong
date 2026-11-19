import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // SLUSHPILE_URL is read in exactly one place — src/lib/site/env.ts — so the
  // rewrite, the nav slot, and the e2e suite (through env.ts) agree.
  {
    files: ["**/*.{ts,tsx,js,mjs,cjs}"],
    ignores: ["src/lib/site/env.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        // process.env.SLUSHPILE_URL, process.env["SLUSHPILE_URL"], and
        // const { SLUSHPILE_URL } = process.env.
        ...[
          "MemberExpression[object.object.name='process'][object.property.name='env'][property.name='SLUSHPILE_URL']",
          "MemberExpression[object.object.name='process'][object.property.name='env'][property.value='SLUSHPILE_URL']",
          "VariableDeclarator[init.object.name='process'][init.property.name='env'] Property[key.name='SLUSHPILE_URL']",
        ].map((selector) => ({
          selector,
          message:
            "Read SLUSHPILE_URL via src/lib/site/env.ts so the rewrite and nav slot agree on flag state.",
        })),
      ],
    },
  },
]);
