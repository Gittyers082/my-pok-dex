// ============================================
// main.js — the app's entry point
// ============================================

import { getPokemon } from "./api.js";

const screen = document.getElementById("screen");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function printLine(text) {
  const p = document.createElement("p");
  p.textContent = "> " + text;
  screen.appendChild(p);
}

function renderPokemon(pokemon) {
  const number = String(pokemon.id).padStart(4, "0");

  screen.innerHTML = `
    <article class="entry">
      <img class="entry-sprite" src="${pokemon.sprite}" alt="${pokemon.name}">
      <p class="entry-number">No. ${number}</p>
      <h2 class="entry-name">${pokemon.name}</h2>
      <p class="entry-types">
        ${pokemon.types.map((type) => `<span class="type">${type}</span>`).join("")}
      </p>
      <p class="entry-size">HT ${pokemon.height} m · WT ${pokemon.weight} kg</p>
    </article>
  `;
}

async function boot() {
  printLine("BOOTING DEX OS v0.2...");
  await sleep(400);
  printLine("CONNECTING TO DATABASE...");

  const randomId = Math.floor(Math.random() * 1025) + 1;

  try {
    const pokemon = await getPokemon(randomId);
    console.log("Got from API:", pokemon);
    renderPokemon(pokemon);
  } catch (error) {
    printLine("ERROR: " + error.message);
  }
}

boot();
