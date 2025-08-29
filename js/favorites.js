import { getPokemonData, loadAndDisplayPokemon } from "./main.js";

console.log(getPokemonData().then((data) => console.log(data)));

console.log(loadAndDisplayPokemon().then((data) => console.log(data)));

const createFavoriteCard = (card) => {
  const gallery = document.querySelector(".favorites-gallery");
  console.log(gallery);
  gallery.append(card);
};

createFavoriteCard();
