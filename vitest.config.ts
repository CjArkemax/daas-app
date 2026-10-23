import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node', // We are testing pure functions, not React components yet
    include: ['tests/unit/**/*.test.ts'],
  },
});