#!/usr/bin/env node
/**
 * Print a compact, machine-and-human-readable snapshot of the project so an
 * AI assistant (or new contributor) can prime its context without having to
 * read the entire repo. Designed for the start of a Claude Code / Cursor /
 * other LLM session.
 *
 * Usage: npm run ai:context
 */
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = dirname(here);
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const sh = (cmd) => {
  try {
    return execSync(cmd, { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
};

const heading = (text) => {
  console.log('');
  console.log(text);
  console.log('-'.repeat(text.length));
};

console.log(`# ${pkg.name} @ ${pkg.version}`);
console.log(pkg.description ?? '');

heading('Runtime');
console.log(`node engines: ${pkg.engines?.node ?? '(unspecified)'}`);
const nvmrc = existsSync(join(root, '.nvmrc'))
  ? readFileSync(join(root, '.nvmrc'), 'utf8').trim()
  : '(none)';
console.log(`.nvmrc: ${nvmrc}`);
console.log(`current node: ${process.version}`);

heading('Scripts');
for (const [name, body] of Object.entries(pkg.scripts ?? {})) {
  console.log(`  ${name.padEnd(22)} ${body.length > 90 ? body.slice(0, 87) + '...' : body}`);
}

heading('Public exports');
const indexPath = join(root, 'src', 'index.ts');
if (existsSync(indexPath)) {
  console.log(readFileSync(indexPath, 'utf8').trim());
}

heading('ADRs');
const adrDir = join(root, 'docs', 'adr');
if (existsSync(adrDir)) {
  for (const file of readdirSync(adrDir).sort()) {
    if (file.endsWith('.md') && file !== 'README.md') {
      const head = readFileSync(join(adrDir, file), 'utf8').split('\n', 1)[0];
      console.log(`  ${file.padEnd(50)} ${head.replace(/^# /, '')}`);
    }
  }
}

heading('Git');
console.log(`branch:   ${sh('git rev-parse --abbrev-ref HEAD')}`);
console.log(`HEAD:     ${sh('git log -1 --format="%h %s"')}`);
console.log(`tracking: ${sh('git rev-parse --abbrev-ref --symbolic-full-name @{u}') || '(none)'}`);
const dirty = sh('git status --porcelain');
console.log(`status:   ${dirty ? `${dirty.split('\n').length} uncommitted change(s)` : 'clean'}`);

heading('Gates');
console.log(
  '- npm run check         — fast: lint + typecheck + stylelint + markdownlint + format:check',
);
console.log(
  '- npm run check:ci      — adds tests, build, size, dupes, links, security audit/osv/semgrep/secrets, license',
);
console.log('- npm run check:all     — pre-push: check:ci + security:codeql + security:depcheck');
console.log('- npm run test:e2e      — Playwright against a built demo');
console.log('- npm run lhci          — Lighthouse CI against the built demo');
console.log('');
