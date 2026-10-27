// ============================================
// api.js — every PokéAPI call lives in this file.
// ============================================

const BASE_URL = "https://pokeapi.co/api/v2";

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
  };
}
