const getThirtyPokemon = async () => {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=30");
  const data = await response.json();
  return data.results;
};

const getPokemonData = async () => {
  const basicPokeArr = await getThirtyPokemon();
  const detailedPokeArr = [];
  for (const pokemon of basicPokeArr) {
    const response = await fetch(pokemon.url);
    const data = await response.json();
    detailedPokeArr.push(data);
  }
  console.log(detailedPokeArr);
  return detailedPokeArr;
};

const capitalizeFirstLetter = (data) => {
  return data[0].toUpperCase() + data.slice(1);
};

const getAbilities = (data) => {
  let abilitiesStr = `Abilities: `;
  for (const ability of data) {
    abilitiesStr += `${ability.ability.name} `;
  }
  return abilitiesStr;
};

const getStats = (data) => {
  let statsStr = `Stats: `;
  for (const stats of data) {
    statsStr += `${stats.base_stat} `;
  }
  return statsStr;
};

const createPokeCard = (name, imgSrc, abilities, stats) => {
  const gallery = document.querySelector(".pokemon-gallery");

  const card = document.createElement("div");
  card.className = "pokemon-card";

  const title = document.createElement("div");
  title.className = "pokemon-title";
  title.textContent = name;

  const image = document.createElement("img");
  image.className = "pokemon-image";
  image.src = imgSrc;
  image.alt = `Pokemon card of ${name}`;

  const details = document.createElement("div");
  details.className = "pokemon-details";

  const pokeAbilities = document.createElement("p");
  pokeAbilities.textContent = abilities;
  const pokeStats = document.createElement("p");
  pokeStats.textContent = stats;

  details.append(pokeAbilities, pokeStats);
  card.append(title, image, details);
  gallery.append(card);
};

const loadAndDisplayPokemon = async () => {
  const detailedPokeArr = await getPokemonData();
  detailedPokeArr.forEach((cardData) =>
    createPokeCard(
      capitalizeFirstLetter(cardData.name),
      cardData.sprites.other["official-artwork"].front_default,
      getAbilities(cardData.abilities),
      getStats(cardData.stats)
    )
  );
};

loadAndDisplayPokemon();
