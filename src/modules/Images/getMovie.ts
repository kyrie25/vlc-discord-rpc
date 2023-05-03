import axios from "axios";

import config from "../../config.js";
import { isMatchingTitle, processTitle } from "../../utils.js";

const apiKey = config.TMDb.apiKey;

export async function getMovie(title: string) {
  if (!apiKey) {
    console.log("No TMDb API key provided, skipping movie image");
    return null;
  }
  title = processTitle(title);
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/search/movie",
      {
        params: {
          api_key: apiKey,
          query: title,
        },
      }
    );

    const movie = response.data.results[0];
    if (!movie) return null;

    if (
      !isMatchingTitle(title, movie.title) &&
      !isMatchingTitle(title, movie.original_title)
    )
      return null;

    if (movie.title !== movie.original_title) {
      movie.title = `${movie.title} (${movie.original_title})`;
    }

    return {
      largeImageKey: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      details: movie.title,
      state: `${movie.release_date.slice(0, 4)} | ${movie.vote_average} ★`,
      largeImageText: `${movie.popularity
        .toString()
        .replace(/^0\./, "")
        .replace(/\./g, ",")} views`,
    };
  } catch (error) {
    return null;
  }
}
