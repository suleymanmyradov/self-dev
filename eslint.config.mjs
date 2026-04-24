import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [
    ...nextCoreWebVitals,
    ...nextTypescript,
    ...compat.plugins('unused-imports', 'import'),
    {
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

            // Warn on modules/exports that are not consumed anywhere
            'import/no-unused-modules': [
                'warn',
                {
                    unusedExports: true,
                    missingExports: false,
                    ignoreExports: [
                        'src/app/**',
                        'src/pages/**',
                        'src/app/api/**',
                        'next-env.d.ts',
                    ],
                },
            ],
        },
    },
    {
        ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
    }
];

export default eslintConfig;
