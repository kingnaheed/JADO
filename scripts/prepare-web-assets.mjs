import { cp, mkdir, rm } from 'node:fs/promises';

const webAssets = ['index.html', 'app.js', 'styles.css'];

await rm('www', { recursive: true, force: true });
await mkdir('www', { recursive: true });
await Promise.all(webAssets.map((file) => cp(file, `www/${file}`)));