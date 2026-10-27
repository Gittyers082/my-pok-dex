// ============================================
// router.js — decides which view to show based on the URL hash.
// ============================================

const routes = [];
let screen = null;
let renderCount = 0;
let currentPath = null;
const scrollPositions = {};

export function addRoute(pattern, view) {
  routes.push({ pattern, view });
}

function matchRoute(pattern, path) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

async function render() {
  const path = location.hash.slice(1) || "/";
  if (currentPath !== null) scrollPositions[currentPath] = screen.scrollTop;
  currentPath = path;
  const myRender = ++renderCount;
  const isCurrent = () => myRender === renderCount;

  for (const route of routes) {
    const params = matchRoute(route.pattern, path);
    if (params) {
      screen.scrollTop = 0;
      await route.view(screen, params, isCurrent);
      if (isCurrent()) screen.scrollTop = scrollPositions[path] ?? 0;
      return;
    }
  }

  screen.innerHTML = `<p>> ERROR 404: NO SUCH SCREEN</p><p><a href="#/">&lt; BACK</a></p>`;
}

export function startRouter(screenElement) {
  screen = screenElement;
  window.addEventListener("hashchange", render);
  render();
}
