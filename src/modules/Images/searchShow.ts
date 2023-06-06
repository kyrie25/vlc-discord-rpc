import {
  episodeRegex,
  isMatchingTitle,
  processTitle,
  seasonRegex,
} from "../../utils.js";

import axios from "axios";

export async function searchShow(showName: string, isFileName = false) {
  let season = "";
  let episode = "";
  let episodeTitle = "";

  showName = processTitle(showName);

  if (isFileName) {
    const seasonMatch = showName.match(seasonRegex);
    if (seasonMatch) {
      season = showName.matchAll(seasonRegex).next().value[1];
      showName = showName.replace(seasonRegex, "");
    }

    const episodeMatch = showName.match(episodeRegex);
    if (episodeMatch) {
      episode = showName.matchAll(episodeRegex).next().value[1];

      const episodeTitleMatch = showName.matchAll(episodeRegex).next().value[2];
      if (episodeTitleMatch) episodeTitle = episodeTitleMatch.trim();
      showName = showName.replace(episodeRegex, "");
    }
  }

  try {
    // Use the TVmaze API to search for the show by name
    const response = await axios(
      `http://api.tvmaze.com/search/shows?q=${showName}`
    );

    // Get the first result (most relevant)
    const show = response.data.find((show: any) =>
      isMatchingTitle(show.show.name, showName)
    )?.show;

    if (!show) return null;

    // Use the TVmaze API to get the show's image URL
    const imageResponse = await axios(
      `http://api.tvmaze.com/shows/${show.id}/images`
    );

    // Get the image data
    const imageData = imageResponse.data;

    // Get the first image (most common)
    const image = imageData[0].resolutions.original.url;

    const state = episodeTitle
      ? `S${season}E${episode} | ${episodeTitle}`
      : season
      ? `Season ${season} | Episode ${episode}`
      : episode
      ? `Episode ${episode}`
      : "";

    let buttons = [
      {
        label: "View on TVmaze",
        url: show.url,
      },
    ];

    if (show.externals?.imdb) {
      buttons = [
        {
          label: "View on IMDb",
          url: `https://www.imdb.com/title/${show.externals.imdb}`,
        },
      ];
    }

    if (show.officialSite) {
      buttons.push({
        label: "Official Site",
        url: show.officialSite,
      });
    }

    return {
      [isFileName ? "state" : ""]: state,
      details: show.name,
      largeImageKey: image,
      largeImageText: show.rating.average
        ? `Rating: ${show.rating.average} ★`
        : "",
      buttons,
    };
  } catch {
    return null;
  }
}
