/**
 * Smoke test: reads a real meow-memory database and exercises all three host
 * routes through a mocked DSH context. No DSH restart required.
 */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { apply, discoverWorkspaces, LAYERS, readMemories } from '../lib/index.js'

const here = dirname(fileURLToPath(import.meta.url))
const workspace = process.env.MC_WORKSPACE || resolve(here, '..', '..')
const dbPath = join(workspace, '.dsh-meow', 'memory.db')

console.log('workspace:', workspace)
assert.ok(existsSync(dbPath), '找不到记忆库: ' + dbPath)

const active = readMemories(workspace, false)
assert.ok(active && active.ok, 'readMemories 应返回 ok')
assert.equal(active.layers.length, LAYERS.length, '应有七层元数据')
assert.ok(active.total > 0, '应读到记忆条目')
assert.ok(active.items.every((i) => i.status === 'active'), '默认只返回 active')
assert.ok(active.items.every((i) => LAYERS.some((l) => l.level === i.level)), '层名应合法')
assert.ok(active.items.every((i) => Array.isArray(i.keywords)), '关键词应是数组')

const all = readMemories(workspace, true)
assert.ok(all.total >= active.total, 'all=1 应不少于默认')

const list = await discoverWorkspaces({ get: () => undefined })
assert.ok(Array.isArray(list), '工作区列表应是数组')

const routes = new Map()
const ctx = {
  get: (name) => name === 'webServer'
    ? { register: (route) => { routes.set(route.path, route); return () => {} } }
    : undefined,
  effect: (fn) => fn(),
  logger: { info: () => {} },
}
apply(ctx)
assert.equal(routes.size, 3, '应注册 3 条路由')

function call(path, url) {
  return new Promise((resolve, reject) => {
    const route = routes.get(path)
    if (!route) return reject(new Error('缺少路由 ' + path))
    const timer = setTimeout(() => reject(new Error('路由超时 ' + path)), 3000)
    const res = {
      writeHead() {},
      end(body) { clearTimeout(timer); resolve(String(body)) },
    }
    route.handler({
      url: url || path,
      headers: { host: '127.0.0.1:51506' },
      socket: { remoteAddress: '127.0.0.1' },
    }, res)
  })
}

const app = await call('/meow-constellation/app')
assert.ok(app.includes('记忆星图') && app.includes('<canvas'), '星图页面应返回 HTML')

const wsJson = JSON.parse(await call('/meow-constellation/api/workspaces'))
assert.ok(wsJson.ok && Array.isArray(wsJson.workspaces), '工作区 API 应正常')

const memJson = JSON.parse(await call('/meow-constellation/api/memories'))
assert.ok(memJson.ok && memJson.total > 0, '记忆 API 应返回条目')

// 目录穿越防护：不在发现列表里的路径必须被拒绝
const bad = JSON.parse(await call('/meow-constellation/api/memories',
  '/meow-constellation/api/memories?dir=C%3A%5CWindows'))
assert.equal(bad.ok, false, '任意 dir 应被拒绝')

console.log(JSON.stringify({
  ok: true,
  active: active.total,
  all: all.total,
  workspaces: list.length,
  layerCounts: active.layerCounts,
  appBytes: app.length,
}, null, 2))
