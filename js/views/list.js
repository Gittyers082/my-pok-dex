// ============================================
// views/list.js — the grid of Pokémon
// ============================================

import { getPokemonList } from "../api.js";

const PAGE_SIZE = 30;

function cardHtml(pokemon) {
  const number = String(pokemon.id).padStart(4, "0");
  return `
    <a class="card" href="#/pokemon/${pokemon.id}">
      <img src="${pokemon.sprite}" alt="${pokemon.name}" loading="lazy">
      <span class="card-number">${number}</span>
      <span class="card-name">${pokemon.name}</span>
    </a>
  `;
}

export async function listView(screen, params, isCurrent) {
  screen.innerHTML = `
    <h2 class="screen-title">POKéMON INDEX</h2>
    <div class="grid"></div>
    <button class="load-more">LOAD MORE</button>
  `;

  const grid = screen.querySelector(".grid");
  const button = screen.querySelector(".load-more");
  let offset = 0;

  async function loadPage() {
    button.disabled = true;
    button.textContent = "LOADING...";
    try {
      const pokemonList = await getPokemonList(PAGE_SIZE, offset);
      if (!isCurrent()) return;

      grid.insertAdjacentHTML("beforeend", pokemonList.map(cardHtml).join(""));
      offset += PAGE_SIZE;
      button.textContent = "LOAD MORE";
    } catch (error) {
      button.textContent = "RETRY";
      console.error(error);
    }
    button.disabled = false;
  }

  button.addEventListener("click", loadPage);
  await loadPage();
}
