import { isMatchingTitle, processTitle } from "../../utils.js";

import axios from "axios";

export async function searchShow(showName: string, isFileName = false) {
  let season = "";
  let episode = "";
  let episodeTitle = "";

  if (isFileName) {
    showName = processTitle(showName);

    if (showName.match(/s\d+/gi)) {
      season = showName.match(/s\d+/gi)?.[0].slice(1) || "";
      showName = showName.replace(/s\d+/gi, "");
    }

    const episodeNumberAndTitle = showName.match(/e?\d+( [\w ]+)?$/gi);
    if (episodeNumberAndTitle) {
      episode = episodeNumberAndTitle[0].match(/\d+/)?.[0] || "";

      episodeTitle = episodeNumberAndTitle[0].match(/ [\w ]+$/)?.[0] || "";
      showName = showName.replace(/e?\d+(?: [\w ]+)?$/gi, "");
    }
  }
  try {
    // Use the TVmaze API to search for the show by name
    const response = await axios(
      `http://api.tvmaze.com/search/shows?q=${showName}`
    );

    // Get the first result (most relevant)
    const show = response.data[0].show;

    if (!isMatchingTitle(show.name, showName)) return null;

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
      : `Episode ${episode}`;

    if (isFileName) {
      return {
        state,
        details: show.name,
        largeImageKey: image,
        largeImageText: `Rating: ${show.rating.average} ★`,
        buttons: [
          {
            label: "View on TVmaze",
            url: show.url,
          },
        ],
      };
    }

    return {
      largeImageKey: image,
      largeImageText: `Rating: ${show.rating.average} ★`,
      buttons: [
        {
          label: "View on TVmaze",
          url: show.url,
        },
      ],
    };
  } catch {
    return null;
  }
}
