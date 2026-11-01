import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Uses the local GitHub CLI session; no token is stored or sent to the browser.
const owner = 'UzimakeNarutoszx';
const repositories = JSON.parse(execFileSync('gh', ['repo', 'list', owner, '--limit', '200', '--json', 'name,url,isPrivate'], { encoding: 'utf8' }));
const data = Object.fromEntries(repositories.filter(repo => !repo.isPrivate).sort((a, b) => a.name.localeCompare(b.name)).map(repo => [repo.name, { url: repo.url, private: false }]));
writeFileSync(fileURLToPath(new URL('../src/data/repositories.json', import.meta.url)), JSON.stringify(data, null, 2) + '\n');
console.log(`Synced ${Object.keys(data).length} verified public repositories for ${owner}.`);
