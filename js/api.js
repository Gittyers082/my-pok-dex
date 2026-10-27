// ============================================
// api.js — every PokéAPI call lives in this file.
// ============================================

const BASE_URL = "https://pokeapi.co/api/v2";
const SPRITE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export function spriteUrl(id) {
  return `${SPRITE_URL}/${id}.png`;
}

function idFromUrl(url) {
  const parts = url.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
}

export async function getPokemonList(limit = 30, offset = 0) {
  const response = await fetch(
    `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
  );
  if (!response.ok) {
    throw new Error(`Could not load list (status ${response.status})`);
  }
  const data = await response.json();

  return data.results.map((p) => {
    const id = idFromUrl(p.url);
    return { id, name: p.name, sprite: spriteUrl(id) };
  });
}

const INDEX_KEY = "dex:pokemon-index:v1";
export const LAST_SPECIES_ID = 10000;

function readSavedIndex() {
  try {
    const saved = localStorage.getItem(INDEX_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}
function saveIndex(list) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(list));
  } catch {}
}

async function loadIndex() {
  const saved = readSavedIndex();
  if (saved) return saved;

  const all = await getPokemonList(100000, 0);
  const species = all.filter((p) => p.id < LAST_SPECIES_ID);
  saveIndex(species);
  return species;
}

let indexPromise = null;

export function getPokemonIndex() {
  if (!indexPromise) {
    indexPromise = loadIndex().catch((error) => {
      indexPromise = null;
      throw error;
    });
  }
  return indexPromise;
}

export async function getPokemon(idOrName) {
  const response = await fetch(`${BASE_URL}/pokemon/${idOrName}`);
  if (!response.ok) {
    throw new Error(
      `Pokémon "${idOrName}" not found (status ${response.status})`,
    );
  }
  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    sprite:
      data.sprites.other["official-artwork"].front_default ??
      data.sprites.front_default,
    height: data.height / 10,
    weight: data.weight / 10,
    stats: data.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
  };
}
