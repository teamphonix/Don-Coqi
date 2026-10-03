import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
await mkdir('public/media', { recursive: true });
for (const file of ['index.html', 'app.js', 'style.css', 'catalog.json']) {
  await copyFile(`source/${file}`, `public/${file}`);
}
const images = JSON.parse(await readFile('source/images.json', 'utf8'));
for (const [name, base64] of Object.entries(images)) {
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) throw new Error('Invalid image name');
  await writeFile(`public/media/${name}.jpg`, Buffer.from(base64, 'base64'));
}
console.log(`Built Don Coqui with ${Object.keys(images).length} food photos.`);
