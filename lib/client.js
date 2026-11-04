/**
 * Browser half of dsh-meow-constellation.
 *
 * Adds a small three-dot star cluster launcher to the DSH Web GUI. Clicking it opens the star map
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
      '.orb{position:fixed;right:26px;bottom:92px;width:46px;height:46px;padding:0;border:0;background:transparent;',
      'cursor:pointer;z-index:2147483000;display:block;user-select:none;transition:transform .25s}',
      '.orb span{position:absolute;border-radius:50%;background:#bcd2ff;box-shadow:0 0 10px rgba(150,180,255,.7);',
      'transition:box-shadow .25s,opacity .25s,transform .25s}',
      '.orb span:nth-child(1){width:9px;height:9px;left:6px;top:9px}',
      '.orb span:nth-child(2){width:6px;height:6px;left:25px;top:5px;opacity:.8}',
      '.orb span:nth-child(3){width:12px;height:12px;left:18px;top:24px;background:#ffe2af;box-shadow:0 0 12px rgba(255,210,160,.7)}',
      '.orb:hover{transform:translateY(-3px)}',
      '.orb:hover span{box-shadow:0 0 16px rgba(170,200,255,.95)}',
      '.orb:hover span:nth-child(3){box-shadow:0 0 18px rgba(255,215,165,.95)}',
      '.orb.on span{opacity:1;box-shadow:0 0 14px rgba(190,215,255,.9)}',
      '.orb.on span:nth-child(3){box-shadow:0 0 18px rgba(255,215,165,.95)}',
      '.overlay{position:fixed;inset:0;z-index:2147483100;background:rgba(4,6,14,.98);display:flex;flex-direction:column;padding:14px 18px 18px;box-sizing:border-box}',
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
        + '<button class="orb" title="记忆星图（Alt+M）"><span></span><span></span><span></span></button>'
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
        orb.classList.add('on')
      }
      function hide() {
        overlay.setAttribute('hidden', '')
        frame.src = 'about:blank'
        orb.classList.remove('on')
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
