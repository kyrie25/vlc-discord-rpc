import axios from "axios";

import config from "../../config.js";
import {
  episodeRegex,
  isMatchingTitle,
  processTitle,
  seasonRegex,
} from "../../utils.js";

const clientID = config.myAnimeList.clientID;

export async function getAnime(title: string) {
  let season = "";
  let episode = "";
  let episodeTitle = "";

  title = processTitle(title);

  const seasonMatch = title.match(seasonRegex);
  if (seasonMatch) {
    season = title.matchAll(seasonRegex).next().value[1];
    title = title.replace(seasonRegex, "");
  }

  const episodeMatch = title.match(episodeRegex);
  if (episodeMatch) {
    episode = title.matchAll(episodeRegex).next().value[1];

    const episodeTitleMatch = title.matchAll(episodeRegex).next().value[2];
    if (episodeTitleMatch) episodeTitle = episodeTitleMatch.trim();
    title = title.replace(episodeRegex, "");
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

    anime.state = episodeTitle
      ? `S${season}E${episode} | ${episodeTitle}`
      : season
      ? `Season ${season} | Episode ${episode}`
      : episode
      ? `Episode ${episode}`
      : "";

    return {
      largeImageKey: anime.main_picture.large || anime.main_picture.medium,
      details: anime.title,
      state: anime.state,
      largeImageText: `Rank ${anime.rank} | ${anime.mean} ★`,
      buttons: [
        {
          label: "MyAnimeList",
          url: `https://myanimelist.net/anime/${anime.id}`,
        },
      ],
    };
  } catch {
    return null;
  }
}
