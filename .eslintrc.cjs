module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  plugins: ["unused-imports", "import"],
  rules: {
    // Remove unused imports automatically surfaced by the Assistant UI merge
    "unused-imports/no-unused-imports": "error",

    // Keep normal unused vars as warnings, allow underscore prefix to ignore
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],

    // Warn on modules/exports that are not consumed anywhere (proxy for unused files)
    // Note: we ignore Next.js special routes and framework-consumed files to avoid false positives
    "import/no-unused-modules": [
      "warn",
      {
        unusedExports: true,
        missingExports: false,
        ignoreExports: [
          "src/app/**",
          "src/pages/**",
          "src/app/api/**",
          "next-env.d.ts",
        ],
      },
    ],
  },
};
