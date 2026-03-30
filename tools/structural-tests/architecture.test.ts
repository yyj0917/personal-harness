/**
 * Structural Tests — Architecture Invariant Enforcement
 *
 * These tests verify that the codebase respects the layered architecture.
 * They run in CI and prevent merging code that violates layer boundaries.
 *
 * Layer order: Types → Config → Repo → Service → Runtime → UI
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Allowed import directions (key may import from values)
const ALLOWED_DEPS: Record<string, string[]> = {
  'packages/types': [],
  'packages/config': ['packages/types'],
  'packages/repo': ['packages/config', 'packages/types'],
  'packages/service': ['packages/repo', 'packages/config', 'packages/types'],
  'packages/runtime': ['packages/service', 'packages/config', 'packages/types'],
  'packages/ui': ['packages/service', 'packages/types', 'packages/config'],
};

// Shared packages can be imported from anywhere
const SHARED_PACKAGES = ['packages/shared'];

function findTsFiles(dir: string): string[] {
  const fullPath = path.join(PROJECT_ROOT, dir);
  if (!fs.existsSync(fullPath)) return [];

  try {
    const result = execSync(
      `find "${fullPath}" -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v ".test." | grep -v ".spec."`,
      { encoding: 'utf-8' }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function getImports(filePath: string): string[] {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
  const imports: string[] = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

function resolvePackageLayer(importPath: string): string | null {
  for (const layer of Object.keys(ALLOWED_DEPS)) {
    const packageName = `@project/${layer.split('/')[1]}`;
    if (importPath.startsWith(packageName) || importPath.startsWith(`./${layer}`) || importPath.startsWith(`../${layer}`)) {
      return layer;
    }
  }
  for (const shared of SHARED_PACKAGES) {
    const packageName = `@project/${shared.split('/')[1]}`;
    if (importPath.startsWith(packageName)) {
      return 'shared';
    }
  }
  return null;
}

describe('Architecture Invariants', () => {
  for (const [layer, allowedDeps] of Object.entries(ALLOWED_DEPS)) {
    describe(`${layer}`, () => {
      it(`should only import from allowed layers: [${allowedDeps.join(', ') || 'none'}]`, () => {
        const files = findTsFiles(layer);
        const violations: string[] = [];

        for (const file of files) {
          const imports = getImports(file);
          for (const imp of imports) {
            const importedLayer = resolvePackageLayer(imp);
            if (importedLayer && importedLayer !== 'shared' && !allowedDeps.includes(importedLayer) && importedLayer !== layer) {
              const relFile = path.relative(PROJECT_ROOT, file);
              violations.push(`${relFile} imports from ${importedLayer} (via "${imp}")`);
            }
          }
        }

        if (violations.length > 0) {
          const message = [
            `Layer dependency violations in ${layer}:`,
            ...violations.map(v => `  ❌ ${v}`),
            '',
            `Allowed imports for ${layer}: ${allowedDeps.join(', ') || '(none)'}`,
            `→ See docs/architecture/overview.md for the dependency graph.`,
          ].join('\n');
          expect.fail(message);
        }
      });
    });
  }

  describe('File size limits', () => {
    it('no file should exceed 300 lines', () => {
      const allLayers = Object.keys(ALLOWED_DEPS);
      const violations: string[] = [];

      for (const layer of allLayers) {
        const files = findTsFiles(layer);
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf-8');
          const lineCount = content.split('\n').length;
          if (lineCount > 300) {
            const relFile = path.relative(PROJECT_ROOT, file);
            violations.push(`${relFile}: ${lineCount} lines (max 300)`);
          }
        }
      }

      if (violations.length > 0) {
        expect.fail(`Files exceeding 300 line limit:\n${violations.map(v => `  ❌ ${v}`).join('\n')}`);
      }
    });
  });

  describe('No default exports', () => {
    it('should not use default exports in any package', () => {
      const allLayers = Object.keys(ALLOWED_DEPS);
      const violations: string[] = [];

      for (const layer of allLayers) {
        const files = findTsFiles(layer);
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf-8');
          if (/export\s+default\s/.test(content)) {
            const relFile = path.relative(PROJECT_ROOT, file);
            violations.push(relFile);
          }
        }
      }

      if (violations.length > 0) {
        expect.fail(`Default exports found (use named exports only):\n${violations.map(v => `  ❌ ${v}`).join('\n')}`);
      }
    });
  });

  describe('Structured logging', () => {
    it('should not use console.log in any package', () => {
      const allLayers = Object.keys(ALLOWED_DEPS);
      const violations: string[] = [];

      for (const layer of allLayers) {
        const files = findTsFiles(layer);
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf-8');
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (/console\.(log|warn|error|info|debug)\(/.test(line) && !line.trim().startsWith('//')) {
              const relFile = path.relative(PROJECT_ROOT, file);
              violations.push(`${relFile}:${idx + 1} — use structured logger instead of console.*`);
            }
          });
        }
      }

      if (violations.length > 0) {
        expect.fail(`console.* usage detected (use packages/shared/logger):\n${violations.map(v => `  ❌ ${v}`).join('\n')}`);
      }
    });
  });
});
