// ============================================
// main.js — the app's entry point
// ============================================

import { addRoute, startRouter } from "./router.js";
import { listView } from "./views/list.js";
import { detailView } from "./views/detail.js";

const screen = document.getElementById("screen");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function printLine(text) {
  const p = document.createElement("p");
  p.textContent = "> " + text;
  screen.appendChild(p);
}

addRoute("/", listView);
addRoute("/pokemon/:id", detailView);

async function boot() {
  printLine("BOOTING DEX OS v0.3...");
  await sleep(400);
  printLine("READY.");
  await sleep(300);
  startRouter(screen);
}

boot();
