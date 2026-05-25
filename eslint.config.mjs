import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = [
    ...nextCoreWebVitals,
    ...nextTypescript,
    {
        plugins: {
            'unused-imports': unusedImports,
        },
        rules: {
            // Remove unused imports automatically
            'unused-imports/no-unused-imports': 'error',

            // Keep normal unused vars as warnings, allow underscore prefix to ignore
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
        },
    },
    {
        ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
    }
];

export default eslintConfig;
