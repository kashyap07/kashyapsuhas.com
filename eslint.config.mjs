import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

// flat config for eslint 9 + next 16. `next lint` was removed in next 16, so
// this is now run directly via `eslint .` (see the lint script in package.json).
// 1:1 port of the old .eslintrc.json (next/core-web-vitals + next/typescript).
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // these two arrived with the eslint-config-next 16 / react-hooks bump and
  // flag intentional patterns here (client-time init, scroll/active sync,
  // render-once server components), not bugs. keep them as warnings, not blockers.
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
    },
  },
  // build output + generated code, nothing here is hand-written.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "tina/__generated__/**",
    "public/**",
    "next-env.d.ts",
  ]),
]);
