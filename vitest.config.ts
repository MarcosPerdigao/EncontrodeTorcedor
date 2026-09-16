import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/contracts/tests/**/*.test.ts', 'tests/foundation/**/*.test.ts'],
    clearMocks: true,
    restoreMocks: true,
  },
});
