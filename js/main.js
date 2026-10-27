// ============================================
// main.js — the app's entry point
// ============================================

import { addRoute, startRouter } from "./router.js";
import { startControls } from "./controls.js";
import { listView } from "./views/list.js";
import { detailView } from "./views/detail.js";

const screen = document.getElementById("screen");
const lights = document.getElementById("lights");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function printLine(text) {
  const p = document.createElement("p");
  p.textContent = "> " + text;
  screen.appendChild(p);
}

function setStatus(status) {
  lights.dataset.status = status; // <div data-status="online">
  lights.setAttribute("aria-label", `Connection status: ${status}`);
}

function updateOnlineStatus() {
  setStatus(navigator.onLine ? "online" : "offline");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker
    .register("./sw.js")
    .then((reg) => console.log("Service worker registered, scope:", reg.scope))
    .catch((error) => console.error("Service worker failed:", error));
}

addRoute("/", listView);
addRoute("/pokemon/:id", detailView);

async function boot() {
  setStatus("booting");
  printLine("BOOTING DEX OS v0.6...");
  await sleep(400);
  printLine(
    navigator.onLine ? "LINK: ONLINE" : "LINK: OFFLINE — USING SAVED DATA",
  );
  await sleep(300);

  updateOnlineStatus();
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);

  startRouter(screen);
  startControls(screen);
  registerServiceWorker();
}

boot();
