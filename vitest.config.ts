import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'packages/**/*.test.ts',
      'packages/**/*.spec.ts',
      'tools/structural-tests/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/index.ts'],
      thresholds: {
        // Service layer: 80% minimum
        // Overall: 60% minimum
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@project/types': path.resolve(__dirname, 'packages/types/src'),
      '@project/config': path.resolve(__dirname, 'packages/config/src'),
      '@project/repo': path.resolve(__dirname, 'packages/repo/src'),
      '@project/service': path.resolve(__dirname, 'packages/service/src'),
      '@project/runtime': path.resolve(__dirname, 'packages/runtime/src'),
      '@project/ui': path.resolve(__dirname, 'packages/ui/src'),
    },
  },
});
