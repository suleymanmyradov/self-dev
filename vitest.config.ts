import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    test: {
        // Default to node environment for pure-logic tests. Component tests opt
        // into jsdom via a `// @vitest-environment jsdom` pragma at the top of
        // the file. Server-action tests stay in node and mock next/headers etc.
        environment: 'node',
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        setupFiles: ['src/test/setup.ts'],
    },
});
