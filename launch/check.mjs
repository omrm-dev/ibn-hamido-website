// Pre-deploy check for the production Coming Soon site. Vercel runs it as the build command
// (vercel.json), so a production deploy fails while anything below is still unfinished.
// Run locally:  node check.mjs        Preview deploys only:  ALLOW_PLACEHOLDERS=1 node check.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const problems = [];
const files = readdirSync('.').filter((f) => /\.(html|txt|xml)$/.test(f));
for (const f of files) {
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/\[(?:[A-Z@]|OWNER|VERIFY)[^\]\n]{0,160}\]/g)) problems.push(`${f}:${i + 1}  placeholder ${m[0]}`);
    if (/noindex/i.test(line) && f !== '404.html') problems.push(`${f}:${i + 1}  noindex tag on a production page`);
    if (/AI concept|Stand-in/.test(line)) problems.push(`${f}:${i + 1}  mockup photo tag`);
  });
}
const ai = JSON.parse(readFileSync('ai-concept-hashes.json', 'utf8'));
for (const [file, hash] of Object.entries(ai)) {
  const now = createHash('sha256').update(readFileSync(file)).digest('hex');
  if (now === hash) problems.push(`${file}  is still the AI concept image: replace it with a real photo (same file name)`);
}

if (problems.length) {
  console.log(`\n${problems.length} thing(s) to finish before this site can go live:\n`);
  for (const p of problems) console.log('  - ' + p);
  console.log('');
  if (process.env.ALLOW_PLACEHOLDERS === '1' && process.env.VERCEL_ENV !== 'production') {
    console.log('ALLOW_PLACEHOLDERS=1 on a non-production deploy: continuing.\n');
    process.exit(0);
  }
  process.exit(1);
}
console.log('Launch check passed: no placeholders, no AI concept photos.');
