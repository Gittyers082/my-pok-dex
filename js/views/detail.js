// ============================================
// views/detail.js — one Pokémon's full entry
// ============================================

import { getPokemon } from "../api.js";

const STAT_LABELS = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SP.A",
  "special-defense": "SP.D",
  speed: "SPD",
};

const MAX_STAT = 255;

function statsHtml(stats) {
  return stats
    .map((s) => {
      const percent = Math.round((s.value / MAX_STAT) * 100);
      return `
        <div class="stat">
          <span class="stat-name">${STAT_LABELS[s.name] ?? s.name}</span>
          <span class="stat-value">${s.value}</span>
          <div class="stat-bar"><div class="stat-fill" style="width:${percent}%"></div></div>
        </div>
      `;
    })
    .join("");
}

export async function detailView(screen, params, isCurrent) {
  screen.innerHTML = `<p>> SCANNING #${params.id}...</p>`;

  try {
    const pokemon = await getPokemon(params.id);
    if (!isCurrent()) return;

    const number = String(pokemon.id).padStart(4, "0");
    screen.innerHTML = `
      <a class="back-link" href="#/">&lt; BACK</a>
      <article class="entry">
        <img class="entry-sprite" src="${pokemon.sprite}" alt="${pokemon.name}">
        <p class="entry-number">No. ${number}</p>
        <h2 class="entry-name">${pokemon.name}</h2>
        <p class="entry-types">
          ${pokemon.types.map((type) => `<span class="type">${type}</span>`).join("")}
        </p>
        <p class="entry-size">HT ${pokemon.height} m · WT ${pokemon.weight} kg</p>
        <section class="stats">${statsHtml(pokemon.stats)}</section>
      </article>
    `;
  } catch (error) {
    if (!isCurrent()) return;
    screen.innerHTML = `
      <p>> ERROR: ${error.message}</p>
      <a class="back-link" href="#/">&lt; BACK</a>
    `;
  }
}
