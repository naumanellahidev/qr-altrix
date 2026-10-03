import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Unit tests run in plain Node. Two server-only concerns are stubbed so that modules
 * written for the Next.js server can be imported directly:
 *   - `server-only`, which throws outside a React Server Component graph,
 *   - `next/headers`, which needs a live request context.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globals: true,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: {
    alias: [
      { find: 'server-only', replacement: path.resolve(__dirname, './tests/stubs/server-only.ts') },
      { find: 'next/headers', replacement: path.resolve(__dirname, './tests/stubs/next-headers.ts') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
});
