// 部署前检查：站内绝对路径、内链、超大资源。
import { readdir, readFile, stat } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const DIST = 'dist'
const BASE = '/personal/'
const TEXT = new Set(['.html', '.js', '.mjs', '.css', '.json', '.svg', '.xml'])
const INTERNAL = /(["'`])\/(assets|media|projects|music|scores|about|favicon\.svg)(?=[/"'`])/g
const errors = []

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...await walk(path))
    else out.push(path)
  }
  return out
}

const files = await walk(DIST)
for (const file of files) {
  const info = await stat(file)
  if (info.size > 8 * 1024 * 1024) errors.push(`超大资源 ${relative('.', file)} ${(info.size / 1048576).toFixed(1)}MB`)
  if (!TEXT.has(extname(file))) continue
  const source = await readFile(file, 'utf8')
  if (INTERNAL.test(source)) errors.push(`站内路径未加 base：${relative('.', file)}`)
  if (source.includes('r2.motionsites.dev')) errors.push(`仍依赖外部 Hero 视频：${relative('.', file)}`)
  for (const match of source.matchAll(/(?:href|src)="(\/personal\/[^"#?]*)/g)) {
    const target = match[1].slice(BASE.length)
    const candidates = [join(DIST, target), join(DIST, target, 'index.html'), join(DIST, `${target}.html`)]
    let found = false
    for (const candidate of candidates) { try { await stat(candidate); found = true; break } catch {} }
    if (!found) errors.push(`内链缺失：${match[1]}（来自 ${relative('.', file)}）`)
  }
}

if (errors.length) {
  console.error(`check-build: ${errors.length} 个问题`)
  for (const error of errors.slice(0, 40)) console.error(' -', error)
  process.exit(1)
}
console.log(`check-build: ${files.length} 个文件通过`)
