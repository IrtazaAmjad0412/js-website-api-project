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
  return detailedPokeArr;
};

const capitalizeFirstLetter = (data) => data[0].toUpperCase() + data.slice(1);

const getAbilities = (data) =>
  `Abilities: ${data.map((ability) => ability.ability.name).join(", ")}`;

const getStats = (data) => `Stats: ${data.map((stat) => stat.base_stat).join(" ")}`;

const getFavorites = () => JSON.parse(localStorage.getItem("favorites")) || [];

const setFavorites = (favorites) =>
  localStorage.setItem("favorites", JSON.stringify(favorites));

const addFavorite = (name, imgSrc, abilities, stats) => {
  const favorites = getFavorites();
  if (!favorites.some((pokemon) => pokemon.name === name)) {
    favorites.push({ name, imgSrc, abilities, stats });
    setFavorites(favorites);
  }
};

const removeFavorite = (name) =>
  setFavorites(getFavorites().filter((pokemon) => pokemon.name !== name));

const createPokeCard = (name, imgSrc, abilities, stats, isFavoritePage = false) => {
  const pokemonGallery = document.querySelector(".pokemon-gallery");
  const favoritesGallery = document.querySelector(".favorites-gallery");
  const activeGallery = isFavoritePage ? favoritesGallery : pokemonGallery;

  if (!activeGallery) {
    console.warn("No gallery found to append the card!");
    return;
  }

  const card = document.createElement("div");
  card.className = "pokemon-card";

  const heading = document.createElement("div");
  heading.className = "pokemon-heading";

  const title = document.createElement("h2");
  title.textContent = name;
  const favorite = document.createElement("i");

  isFavoritePage
    ? favorite.classList.add("fa-solid", "fa-xmark")
    : favorite.classList.add("fa-solid", "fa-heart");

  if (!isFavoritePage) {
    favorite.addEventListener("click", () => {
      const favorites = getFavorites();
      if (favorites.some((pokemon) => pokemon.name === name)) {
        removeFavorite(name);
        favorite.classList.add("fa-xmark");
        favorite.classList.remove("fa-heart");
      } else {
        addFavorite(name, imgSrc, abilities, stats);
        favorite.classList.remove("fa-heart");
        favorite.classList.add("fa-xmark");
        card.remove();
      }
    });
  }

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
  heading.append(title, favorite);
  card.append(heading, image, details);
  activeGallery.append(card);
};

const loadAndDisplayPokemon = async () => {
  const onPokedexPage = !!document.querySelector(".pokemon-gallery");
  if (onPokedexPage) {
    const detailedPokeArr = await getPokemonData();
    const favorites = getFavorites();
    detailedPokeArr
      .filter(
        (cardData) =>
          !favorites.some((pokemon) => pokemon.name.toLowerCase() === cardData.name)
      )
      .forEach((cardData) =>
        createPokeCard(
          capitalizeFirstLetter(cardData.name),
          cardData.sprites.other["official-artwork"].front_default,
          getAbilities(cardData.abilities),
          getStats(cardData.stats),
          false
        )
      );
  } else {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    favorites.forEach((cardData) =>
      createPokeCard(
        cardData.name,
        cardData.imgSrc,
        cardData.abilities,
        cardData.stats,
        true
      )
    );
  }
};

loadAndDisplayPokemon();
