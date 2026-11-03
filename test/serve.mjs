/** 本地冒烟服务器：用真实 memory.db 喂星图页面，验证完整链路。 */
import http from 'node:http'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readMemories } from '../lib/index.js'

const here = dirname(fileURLToPath(import.meta.url))
const workspace = process.env.MC_WORKSPACE || resolve(here, '..', '..')
const page = readFileSync(new URL('../lib/constellation.html', import.meta.url), 'utf8')
const port = 51999

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  const json = (body, code = 200) => {
    res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(body))
  }
  if (url.pathname === '/' || url.pathname === '/meow-constellation/app') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    return res.end(page)
  }
  if (url.pathname === '/meow-constellation/api/workspaces') {
    return json({ ok: true, workspaces: [{ path: workspace, name: 'default-workspace' }], current: workspace })
  }
  if (url.pathname === '/meow-constellation/api/memories') {
    const data = readMemories(workspace, url.searchParams.get('all') === '1')
    // 在 npm 安装目录下没有记忆库时，让页面自己回落到演示数据。
    return json(data || { ok: false, error: '当前目录没有 .dsh-meow/memory.db' })
  }
  json({ ok: false, error: 'not found' }, 404)
})
server.listen(port, '127.0.0.1', () => console.log('smoke server on ' + port))
