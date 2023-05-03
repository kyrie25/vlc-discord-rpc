import axios from "axios";

import config from "../../config.js";
import { isMatchingTitle, processTitle } from "../../utils.js";

const clientID = config.myAnimeList.clientID;

export async function getAnime(title: string) {
  if (!clientID) {
    console.log("No MyAnimeList client ID provided, skipping anime image");
    return null;
  }

  let season = "";
  let episode = "";
  title = processTitle(title);

  if (title.match(/s\d+/gi)) {
    season = title.match(/s\d+/gi)?.[0].slice(1) || "";
    title = title.replace(/s\d+/gi, "");
  }

  if (title.match(/e?\d+(?: [\w ]+)?$/gi)) {
    episode = title.match(/e?\d+/gi)?.[0] || "";
    if (episode[0].toLowerCase() === "e") episode = episode.slice(1);
    title = title.replace(/e?\d+(?: [\w ]+)?$/gi, "");
  }

  try {
    const response = await axios.get("https://api.myanimelist.net/v2/anime", {
      params: {
        q: title,
      },
      headers: {
        "X-MAL-CLIENT-ID": clientID,
      },
    });

    const animes = response.data.data[0]?.node;
    if (!animes) return null;

    const fetchAnime = await axios.get(
      `https://api.myanimelist.net/v2/anime/${animes.id}`,
      {
        params: {
          fields: "alternative_titles,main_picture,mean,rank",
        },
        headers: {
          "X-MAL-CLIENT-ID": clientID,
        },
      }
    );

    const anime = fetchAnime.data;
    if (!anime) return null;

    if (
      !isMatchingTitle(title, anime.title) &&
      !isMatchingTitle(title, anime.alternative_titles.en) &&
      !isMatchingTitle(title, anime.alternative_titles.ja)
    )
      return null;

    if (
      anime.alternative_titles.ja &&
      anime.title !== anime.alternative_titles.ja
    ) {
      anime.title = `${anime.title} (${anime.alternative_titles.ja})`;
    }

    if (season && episode) {
      anime.state = `Season ${season} | Episode ${episode}`;
    } else if (episode) {
      anime.state = `Episode ${episode}`;
    }

    return {
      largeImageKey: anime.main_picture.large || anime.main_picture.medium,
      details: anime.title,
      state: anime.state || undefined,
      largeImageText: `Rank ${anime.rank} | ${anime.mean} ★`,
      buttons: [
        {
          label: "MyAnimeList",
          url: `https://myanimelist.net/anime/${anime.id}`,
        },
      ],
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}
