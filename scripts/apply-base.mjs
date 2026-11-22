// 把构建产物中的站内绝对路径统一加上 Astro base（/personal）。
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const DIST = 'dist'
const BASE = '/personal'
const TEXT = new Set(['.html', '.js', '.mjs', '.css', '.json', '.xml', '.txt', '.svg'])
const ATTR = /(\b(?:href|src|poster|action)=")\/(?!\/|personal\/)([^"]*")/g
const JS_ROOT = /(["'`])\/(assets|media|projects|music|scores|about|favicon\.svg)(?=[/"'`])/g
const CSS_URL = /url\(\/(?!\/|personal\/)/g

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await walk(path))
    else if (TEXT.has(extname(entry.name))) files.push(path)
  }
  return files
}

let changed = 0
for (const file of await walk(DIST)) {
  const before = await readFile(file, 'utf8')
  let after = before
  const ext = extname(file)
  if (ext === '.html') after = after.replace(ATTR, `$1${BASE}/$2`)
  if (ext === '.js' || ext === '.mjs' || ext === '.html') after = after.replace(JS_ROOT, `$1${BASE}/$2`)
  if (ext === '.css' || ext === '.html') after = after.replace(CSS_URL, `url(${BASE}/`)
  // 给曾经 404/缓存过旧文件的媒体加版本参数，避免 Safari 继续用坏缓存。
  if (ext === '.html' || ext === '.js' || ext === '.mjs') {
    after = after.replace(/(\/personal\/(?:media\/(?:audio|scores)|assets\/(?:music|scores|creative-loop\.mp4|projects\/video))\/[^"'`\s?#)]+)(?=["'`\s)])/g, '$1?v=20261122')
  }
  if (after !== before) {
    await writeFile(file, after)
    changed++
  }
}
console.log(`apply-base: ${changed} files updated`)
