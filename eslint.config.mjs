import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
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
];

export default eslintConfig;
