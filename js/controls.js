// ============================================
// controls.js — makes the device's D-pad and A/B buttons work,
// ============================================

let screen = null;
let selected = null;
let movedInsideApp = false;

const SELECTABLE = "a[href], button, input";

function getSelectables() {
  return [...screen.querySelectorAll(SELECTABLE)].filter(
    (el) => el.offsetParent !== null && !el.disabled,
  );
}

function select(el) {
  selected = el;
  el.focus({ preventScroll: true });
  el.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function findNext(from, direction) {
  const a = from.getBoundingClientRect();
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;

  let best = null;
  let bestScore = Infinity;

  for (const el of getSelectables()) {
    if (el === from) continue;
    const b = el.getBoundingClientRect();
    const dx = b.left + b.width / 2 - ax;
    const dy = b.top + b.height / 2 - ay;

    const main = { up: -dy, down: dy, left: -dx, right: dx }[direction];
    const side =
      direction === "up" || direction === "down" ? Math.abs(dx) : Math.abs(dy);

    if (main <= 1) continue;

    const score = main + side * 2;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  return best;
}

function move(direction) {
  if (!selected || !screen.contains(selected)) {
    const first = screen.querySelector(".card") ?? getSelectables()[0];
    if (first) select(first);
    return;
  }

  const next = findNext(selected, direction);
  if (next) {
    select(next);
  } else if (direction === "up" || direction === "down") {
    screen.scrollBy({
      top: direction === "down" ? 80 : -80,
      behavior: "smooth",
    });
  }
}

function pressA() {
  if (!selected || !screen.contains(selected)) return move("down");
  if (selected.tagName === "INPUT") return selected.focus();
  selected.click();
}

function pressB() {
  const onHome = location.hash === "" || location.hash === "#/";

  if (onHome) {
    const search = screen.querySelector(".search");
    if (search && search.value) {
      search.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    }
    return;
  }

  if (movedInsideApp) history.back();
  else location.hash = "#/";
}

const ACTIONS = {
  up: () => move("up"),
  down: () => move("down"),
  left: () => move("left"),
  right: () => move("right"),
  a: pressA,
  b: pressB,
};

function flashButton(action) {
  const button = document.querySelector(`[data-action="${action}"]`);
  if (!button) return;
  button.classList.add("pressed");
  setTimeout(() => button.classList.remove("pressed"), 120);
}

const KEYS = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Escape: "b",
  Backspace: "b",
};

function onKeyDown(event) {
  const action = KEYS[event.key];
  if (!action) return;

  const typing = event.target.tagName === "INPUT";
  if (
    typing &&
    (event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === "Backspace" ||
      event.key === "Escape")
  ) {
    return;
  }

  event.preventDefault();
  flashButton(action);
  ACTIONS[action]();
}

export function startControls(screenElement) {
  screen = screenElement;

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => ACTIONS[button.dataset.action]());
  });

  screen.addEventListener("focusin", (event) => {
    selected = event.target;
  });

  window.addEventListener("hashchange", () => {
    movedInsideApp = true;
  });

  document.addEventListener("keydown", onKeyDown);
}
