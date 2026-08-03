import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount React components between tests to avoid leaking state across cases.
afterEach(() => {
    cleanup();
});
