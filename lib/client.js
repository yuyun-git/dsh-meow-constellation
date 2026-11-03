/**
 * Browser half of dsh-meow-constellation.
 *
 * Adds a small glowing orb to the DSH Web GUI. Clicking it opens the star map
 * (served by the host half) in a same-origin iframe overlay; nothing here
 * touches the DOM outside a shadow root, and no DSH service is required.
 */
window.__ModuleLoader__.load({
  id: 'dsh-meow-constellation',
  factory: (require) => {
    var module = { exports: {} }
    var inject = []

    var HOST_ID = 'dsh-meow-constellation-host'
    var APP = '/meow-constellation/app'
    var CSS = [
      ':host{all:initial}',
      '.orb{position:fixed;right:26px;bottom:92px;width:52px;height:52px;border-radius:50%;',
      'background:radial-gradient(circle at 32% 30%,#fff9e8 0%,#ffd7a1 18%,#8ab4ff 55%,#4a3f9e 100%);',
      'border:1px solid rgba(180,200,255,.65);box-shadow:0 0 22px rgba(140,170,255,.65),0 8px 26px rgba(0,0,0,.55);',
      'cursor:pointer;z-index:2147483000;display:grid;place-items:center;color:#10142b;font-size:24px;',
      'font-family:system-ui,sans-serif;transition:transform .25s,box-shadow .25s;user-select:none}',
      '.orb:hover{transform:scale(1.12) rotate(12deg);box-shadow:0 0 34px rgba(160,190,255,.9),0 10px 30px rgba(0,0,0,.6)}',
      '.orb::after{content:"";position:absolute;inset:-7px;border-radius:50%;border:1px solid rgba(150,175,255,.28);animation:pulse 3.2s ease-out infinite}',
      '@keyframes pulse{0%{transform:scale(.85);opacity:.8}100%{transform:scale(1.35);opacity:0}}',
      '.overlay{position:fixed;inset:0;z-index:2147483100;background:rgba(4,6,14,.94);',
      'backdrop-filter:blur(8px);display:flex;flex-direction:column;padding:14px 18px 18px;box-sizing:border-box}',
      '.overlay[hidden]{display:none}',
      '.bar{display:flex;align-items:center;gap:14px;height:44px;flex:0 0 44px;color:#e8ecff;font:14px/1 system-ui,"PingFang SC","Microsoft YaHei",sans-serif;letter-spacing:2px}',
      '.bar .title{font-size:18px;font-weight:600;text-shadow:0 0 18px rgba(140,170,255,.6)}',
      '.bar .spacer{flex:1}',
      '.bar button{background:rgba(255,255,255,.07);color:#cdd8ff;border:1px solid rgba(150,175,255,.28);',
      'border-radius:9px;padding:7px 14px;cursor:pointer;font:inherit;letter-spacing:1px}',
      '.bar button:hover{background:rgba(140,170,255,.18);color:#fff}',
      '.bar .close{font-size:18px;padding:4px 12px}',
      'iframe{flex:1;width:100%;border:1px solid rgba(150,175,255,.22);border-radius:14px;background:#05070f}',
    ].join('')

    function apply(ctx) {
      if (document.getElementById(HOST_ID)) return () => {}

      var host = document.createElement('div')
      host.id = HOST_ID
      var root = host.attachShadow({ mode: 'open' })
      root.innerHTML = '<style>' + CSS + '</style>'
        + '<button class="orb" title="记忆星图（Alt+M）">✦</button>'
        + '<div class="overlay" hidden>'
        + '<div class="bar"><span class="title">✦ 记忆星图</span>'
        + '<span class="spacer"></span>'
        + '<button class="refresh">刷新</button>'
        + '<button class="popout">新窗口</button>'
        + '<button class="close" title="关闭（Esc）">×</button></div>'
        + '<iframe allow="clipboard-write" title="记忆星图"></iframe></div>'

      document.body.appendChild(host)

      var orb = root.querySelector('.orb')
      var overlay = root.querySelector('.overlay')
      var frame = root.querySelector('iframe')
      var refresh = root.querySelector('.refresh')
      var popout = root.querySelector('.popout')
      var close = root.querySelector('.close')

      function show() {
        overlay.removeAttribute('hidden')
        frame.src = APP + '?t=' + Date.now()
        orb.textContent = '✧'
      }
      function hide() {
        overlay.setAttribute('hidden', '')
        frame.src = 'about:blank'
        orb.textContent = '✦'
      }
      function toggle() {
        if (overlay.hasAttribute('hidden')) show()
        else hide()
      }
      function onKey(e) {
        if (e.altKey && (e.key === 'm' || e.key === 'M')) { e.preventDefault(); toggle() }
        else if (e.key === 'Escape' && !overlay.hasAttribute('hidden')) hide()
      }

      orb.addEventListener('click', toggle)
      close.addEventListener('click', hide)
      refresh.addEventListener('click', function () { frame.src = APP + '?t=' + Date.now() })
      popout.addEventListener('click', function () { window.open(APP, '_blank', 'width=1440,height=900') })
      window.addEventListener('keydown', onKey)

      return function () {
        window.removeEventListener('keydown', onKey)
        host.remove()
      }
    }

    var client_exports = {}
    Object.defineProperty(client_exports, '__esModule', { value: true })
    Object.defineProperty(client_exports, 'apply', { enumerable: true, get: function () { return apply } })
    Object.defineProperty(client_exports, 'inject', { enumerable: true, get: function () { return inject } })
    module.exports = client_exports
    return module.exports
  },
})
