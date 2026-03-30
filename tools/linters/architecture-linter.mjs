#!/usr/bin/env node
/**
 * Custom Architecture Linter
 *
 * Enforces layer dependency rules mechanically.
 * Error messages are written to be useful to both humans AND agents —
 * each error includes the fix instruction so agents can self-correct.
 *
 * Usage: node tools/linters/architecture-linter.mjs [--fix]
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

const LAYER_ORDER = ['types', 'config', 'repo', 'service', 'runtime', 'ui'];

const ALLOWED_DEPS = {
  types: [],
  config: ['types'],
  repo: ['config', 'types'],
  service: ['repo', 'config', 'types'],
  runtime: ['service', 'config', 'types'],
  ui: ['service', 'types', 'config'],
};

const MAX_FILE_LINES = 300;

function walkDir(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.(test|spec)\.(ts|tsx)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function getLayerFromPath(filePath) {
  const rel = relative(join(PROJECT_ROOT, 'packages'), filePath);
  const layer = rel.split('/')[0];
  return LAYER_ORDER.includes(layer) ? layer : null;
}

function extractImports(content) {
  const regex = /(?:import|from)\s+['"](@project\/([^'"\/]+))['"]/g;
  const imports = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    imports.push({ full: match[1], package: match[2] });
  }
  return imports;
}

let errorCount = 0;
const errors = [];

function reportError(file, message, fix) {
  errorCount++;
  const relFile = relative(PROJECT_ROOT, file);
  errors.push({ file: relFile, message, fix });
  console.error(`\n❌ ${relFile}`);
  console.error(`   ${message}`);
  console.error(`   → FIX: ${fix}`);
}

// Check each layer
for (const layer of LAYER_ORDER) {
  const layerDir = join(PROJECT_ROOT, 'packages', layer);
  const files = walkDir(layerDir);

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    // Check file size
    if (lines.length > MAX_FILE_LINES) {
      reportError(
        file,
        `File has ${lines.length} lines (max ${MAX_FILE_LINES}).`,
        `Split this file into smaller modules. Extract types, utilities, or sub-components into separate files.`
      );
    }

    // Check layer dependencies
    const imports = extractImports(content);
    const allowed = ALLOWED_DEPS[layer] || [];

    for (const imp of imports) {
      if (imp.package === 'shared') continue; // shared is always allowed
      if (imp.package === layer) continue; // same layer is allowed
      if (!allowed.includes(imp.package)) {
        reportError(
          file,
          `'${layer}' layer imports from '${imp.package}' layer (via "${imp.full}"). This violates the dependency rule.`,
          `Move this logic to the '${imp.package}' layer, or use the Providers interface for cross-cutting concerns. See docs/architecture/overview.md`
        );
      }
    }

    // Check for console.log
    lines.forEach((line, idx) => {
      if (/console\.(log|warn|error|info|debug)\(/.test(line) && !line.trim().startsWith('//')) {
        reportError(
          file,
          `Line ${idx + 1}: console.${line.match(/console\.(\w+)/)?.[1]} usage detected.`,
          `Use the structured logger from @project/shared/logger instead. Import: import { logger } from '@project/shared/logger';`
        );
      }
    });

    // Check for default exports
    if (/export\s+default\s/.test(content)) {
      reportError(
        file,
        `Default export detected. This project uses named exports only.`,
        `Replace 'export default ...' with 'export const/function/class ...' and update all import sites.`
      );
    }
  }
}

// Summary
console.log(`\n${'='.repeat(60)}`);
if (errorCount === 0) {
  console.log('✅ Architecture lint passed — no violations found.');
  process.exit(0);
} else {
  console.error(`\n❌ Architecture lint failed — ${errorCount} violation(s) found.`);
  console.error(`→ See docs/architecture/overview.md for the dependency graph.`);
  console.error(`→ See docs/conventions/coding.md for coding rules.`);
  process.exit(1);
}
