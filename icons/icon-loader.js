// icon-loader.js — Design & Icons Visualizer
// Utilisation : <i icon="house"></i>
// <script src="ui/icons/icon-loader.js"></script>
(function () {
  const se = document.currentScript;
  function base() {
    if (se) {
      const c = se.getAttribute("data-icons-path");
      if (c) return c.endsWith("/") ? c : c + "/";
      return se.src.replace(/[^/]+$/, "");
    }
    return "ui/icons/";
  }
  const BASE = base(),
    cache = new Map();
  function get(n) {
    if (!cache.has(n)) {
      const u = BASE + n + ".svg";
      cache.set(
        n,
        fetch(u)
          .then((r) => {
            if (!r.ok) throw r.status;
            return r.text();
          })
          .catch(() => {
            cache.set(n, Promise.resolve(null));
            console.warn("[icon-loader]", u);
            return null;
          }),
      );
    }
    return cache.get(n);
  }
  function build(c) {
    const t = document.createElement("div");
    t.innerHTML = c.trim();
    const s = t.querySelector("svg");
    if (!s) return null;
    const hf =
        s.innerHTML.includes('fill="') && !s.innerHTML.includes('fill="none"'),
      hs = s.innerHTML.includes("stroke=");
    if (hs && !hf) {
      s.setAttribute("fill", "none");
      s.innerHTML = s.innerHTML.replace(
        /stroke="(?!none)[^"]+"/g,
        'stroke="currentColor"',
      );
    } else {
      s.setAttribute("fill", "currentColor");
      s.innerHTML = s.innerHTML.replace(
        /fill="(?!none)[^"]+"/g,
        'fill="currentColor"',
      );
    }
    s.removeAttribute("width");
    s.removeAttribute("height");
    s.setAttribute("width", "1em");
    s.setAttribute("height", "1em");
    s.setAttribute("aria-hidden", "true");
    s.style.cssText =
      "display:inline-block;vertical-align:-0.125em;flex-shrink:0;margin-right:0.3em;";
    return s;
  }
  function inject(el) {
    if (el._done) return;
    el._done = true;
    const n = el.getAttribute("icon");
    if (!n) return;
    get(n).then((c) => {
      if (!c) {
        el.style.cssText =
          "display:inline-block;width:1em;height:1em;background:currentColor;opacity:.3;border-radius:2px;";
        return;
      }
      const s = build(c);
      if (s) {
        for (const a of Array.from(el.attributes))
          if (!["icon", "width", "height", "fill", "stroke"].includes(a.name))
            s.setAttribute(a.name, a.value);
        el.replaceWith(s);
      }
    });
  }
  function scan() {
    document.querySelectorAll("i[icon]").forEach(inject);
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", scan)
    : scan();
  new MutationObserver((ms) =>
    ms.forEach((m) =>
      m.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        if (n.matches?.("i[icon]")) inject(n);
        n.querySelectorAll?.("i[icon]").forEach(inject);
      }),
    ),
  ).observe(document.documentElement, { childList: true, subtree: true });
  window.IconLoader = {
    refresh: scan,
    clearCache: () => cache.clear(),
    basePath: BASE,
  };
})();
