// ============================================
// views/list.js — the grid of Pokémon + search
// ============================================

import { getPokemonList, getPokemonIndex } from "../api.js";

const PAGE_SIZE = 30;
const MAX_RESULTS = 60;

let lastQuery = "";
let browsed = [];

function cardHtml(pokemon) {
  const number = String(pokemon.id).padStart(4, "0");
  return `
    <a class="card" href="#/pokemon/${pokemon.id}">
      <img src="${pokemon.sprite}" alt="${pokemon.name}" loading="lazy" crossorigin="anonymous">
      <span class="card-number">${number}</span>
      <span class="card-name">${pokemon.name}</span>
    </a>
  `;
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function searchPokemon(index, query) {
  const q = query.trim().toLowerCase().replace(/^#/, "");

  if (/^\d+$/.test(q)) {
    const n = String(Number(q));
    return index.filter((p) => String(p.id).startsWith(n));
  }

  const matches = index.filter((p) => p.name.includes(q));
  return matches.sort((a, b) => {
    const aStarts = a.name.startsWith(q) ? 0 : 1;
    const bStarts = b.name.startsWith(q) ? 0 : 1;
    return aStarts - bStarts || a.id - b.id;
  });
}

export async function listView(screen, params, isCurrent) {
  screen.innerHTML = `
    <h2 class="screen-title">POKéMON INDEX</h2>
    <input class="search" type="search" placeholder="SEARCH NAME OR NO."
           autocomplete="off" spellcheck="false" aria-label="Search Pokémon">
    <p class="search-status" aria-live="polite"></p>
    <div class="grid"></div>
    <button class="load-more">LOAD MORE</button>
  `;

  const input = screen.querySelector(".search");
  const status = screen.querySelector(".search-status");
  const grid = screen.querySelector(".grid");
  const button = screen.querySelector(".load-more");
  let results = [];

  function showBrowse() {
    status.textContent = "";
    grid.innerHTML = browsed.map(cardHtml).join("");
    button.hidden = false;
  }

  async function loadPage() {
    button.disabled = true;
    button.textContent = "LOADING...";
    try {
      const page = await getPokemonList(PAGE_SIZE, browsed.length);
      if (!isCurrent()) return;
      browsed.push(...page);
      if (!lastQuery)
        grid.insertAdjacentHTML("beforeend", page.map(cardHtml).join(""));
      button.textContent = "LOAD MORE";
    } catch (error) {
      button.textContent = "RETRY";
      console.error(error);
    }
    button.disabled = false;
  }

  async function runSearch(query) {
    lastQuery = query.trim();
    if (!lastQuery) return showBrowse();

    button.hidden = true;
    status.textContent = "SEARCHING...";
    try {
      const index = await getPokemonIndex();
      if (!isCurrent() || query.trim() !== lastQuery) return;

      results = searchPokemon(index, lastQuery);
      const shown = results.slice(0, MAX_RESULTS);
      grid.innerHTML = shown.map(cardHtml).join("");

      if (results.length === 0) status.textContent = "NO MATCH FOUND.";
      else if (results.length > MAX_RESULTS)
        status.textContent = `${results.length} FOUND · SHOWING ${MAX_RESULTS}`;
      else status.textContent = `${results.length} FOUND`;
    } catch (error) {
      status.textContent = "ERROR: COULD NOT LOAD INDEX. CHECK CONNECTION.";
      console.error(error);
    }
  }

  input.addEventListener(
    "input",
    debounce(() => runSearch(input.value), 250),
  );

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && lastQuery && results.length > 0) {
      location.hash = `#/pokemon/${results[0].id}`;
    }
    if (event.key === "Escape") {
      input.value = "";
      runSearch("");
    }
  });

  button.addEventListener("click", loadPage);

  getPokemonIndex().catch(() => {});

  if (lastQuery) {
    input.value = lastQuery;
    await runSearch(lastQuery);
  } else if (browsed.length > 0) {
    showBrowse();
  } else {
    await loadPage();
  }
}
