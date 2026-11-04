import { readFileSync, writeFileSync } from 'node:fs'

const files = {
  'test/wallpaper-dom.test.mjs': [
    ['id: "neko-aurora"', 'id: "naco-neko"'],
    ['wallpapers/neko-aurora.mp4', 'wallpapers/naco-neko.mp4'],
    ['dataset.wall === "neko-aurora"', 'dataset.wall === "naco-neko"'],
    ['id: "neko-ripple"', 'id: "tenene-nachoneko"'],
    ['wallpapers/neko-ripple.mp4', 'wallpapers/tenene-nachoneko.mp4'],
  ],
  'test/settings-render.test.mjs': [
    ['next.id === "neko-aurora"', 'next.id === "naco-neko"'],
    ['const ripple = { id: "neko-ripple"', 'const ripple = { id: "tenene-nachoneko"'],
    ['setCalls.at(-1).to.id === "neko-ripple"', 'setCalls.at(-1).to.id === "tenene-nachoneko"'],
  ],
  'test/rename-compat.test.mjs': [
    ['/purge-wallpapers/neko-aurora.mp4', '/purge-wallpapers/naco-neko.mp4'],
    ['/Xsdsh-purge-next/wallpapers/neko-aurora.mp4', '/Xsdsh-purge-next/wallpapers/naco-neko.mp4'],
  ],
  'lib/wallpapers.js': [
    ['形如 "/neko-aurora.mp4"', '形如 "/naco-neko.mp4"'],
  ],
}

for (const [file, pairs] of Object.entries(files)) {
  let text = readFileSync(file, 'utf8')
  const before = text
  for (const [from, to] of pairs) text = text.split(from).join(to)
  if (text === before) {
    console.log(`skip (no hit): ${file}`)
    continue
  }
  writeFileSync(file, text, 'utf8')
  console.log(`rewritten: ${file}`)
}
