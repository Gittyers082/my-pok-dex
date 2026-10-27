// ============================================
// main.js — the app's entry point
// ============================================

const screen = document.getElementById("screen");

const bootLines = [
  "BOOTING DEX OS v0.1...",
  "LOADING TRAINER PROFILE...",
  "CONNECTING TO DATABASE...",
  "READY.",
];

bootLines.forEach((line, index) => {
  setTimeout(() => {
    const p = document.createElement("p");
    p.textContent = "> " + line;
    screen.appendChild(p);
  }, index * 500);
});
