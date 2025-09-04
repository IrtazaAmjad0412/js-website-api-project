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

  if (favorites.filter((pokemon) => pokemon.name === name).length === 0) {
    favorites.push({ name, imgSrc, abilities, stats });
    setFavorites(favorites);
  }
};

const removeFavorite = (name) =>
  setFavorites(getFavorites().filter((pokemon) => pokemon.name !== name));

const createPokeCard = (name, imgSrc, abilities, stats, isFavoritePage = false) => {
  const activeGallery = isFavoritePage
    ? document.querySelector(".favorites-gallery")
    : document.querySelector(".pokemon-gallery");

  if (!activeGallery) {
    console.warn("No gallery found!");
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

  favorite.addEventListener("click", () => {
    const favorites = getFavorites();

    if (favorites.some((pokemon) => pokemon.name === name)) {
      removeFavorite(name);
    } else {
      addFavorite(name, imgSrc, abilities, stats);
    }
    card.remove();
  });

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
  const isPokedexPage = !!document.querySelector(".pokemon-gallery");
  const favorites = getFavorites();

  if (isPokedexPage) {
    const detailedPokeArr = await getPokemonData();
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

const sortPokemon = async (direction) => {
  const pokemonGallery = document.querySelector(".pokemon-gallery");
  const favoritesGallery = document.querySelector(".favorites-gallery");
  const favorites = getFavorites();

  if (pokemonGallery) {
    const favoriteNames = favorites.map((pokemon) => pokemon.name.toLowerCase());
    const pokemonArr = await getPokemonData();
    pokemonGallery.innerHTML = "";
    pokemonArr
      .filter((pokemon) => !favoriteNames.includes(pokemon.name.toLowerCase()))
      .sort((a, b) =>
        direction === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      )
      .forEach((pokemon) => {
        createPokeCard(
          capitalizeFirstLetter(pokemon.name),
          pokemon.sprites.other["official-artwork"].front_default,
          getAbilities(pokemon.abilities),
          getStats(pokemon.stats),
          false
        );
      });
  } else if (favoritesGallery) {
    favoritesGallery.innerHTML = "";
    favorites
      .sort((a, b) =>
        direction === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      )
      .forEach((pokemon) => {
        createPokeCard(
          pokemon.name,
          pokemon.imgSrc,
          pokemon.abilities,
          pokemon.stats,
          true
        );
      });
  } else {
    console.warn("No gallery found!");
  }
};

const sortBtns = document.querySelectorAll(".sort-btn");

sortBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const sortDir = e.target.dataset.sortDir;
    sortPokemon(sortDir);
  });
});

loadAndDisplayPokemon();

const getPrimaryTypeCount = async () => {
  const pokemonArr = await getPokemonData();
  const pokemonTypes = ["normal", "poison", "bug"];
  const primaryTypeCount = Object.fromEntries(pokemonTypes.map((type) => [type, 0]));

  pokemonArr.forEach((pokemon) => {
    const primaryType = pokemon.types[0].type.name;
    if (pokemonTypes.includes(primaryType)) {
      primaryTypeCount[primaryType]++;
    }
  });

  return primaryTypeCount;
};

const pokemonGallery = document.querySelector(".pokemon-gallery");

if (pokemonGallery) {
  const displayPrimaryTypeCount = async () => {
    const countObj = await getPrimaryTypeCount();
    const main = document.querySelector("main");

    const display = document.createElement("div");
    display.className = "display";

    const displayText = document.createElement("div");
    displayText.className = "display-text";

    Object.entries(countObj).forEach(([type, num]) => {
      const count = document.createElement("p");
      count.textContent = `${type[0].toUpperCase() + type.slice(1)}: ${num}`;
      displayText.append(count);
    });

    display.append(displayText);
    main.prepend(display);
  };

  displayPrimaryTypeCount();
}
