/**
 * Description: Decides what information to display based on the nature of the media (video, music, etc)
 */

import { getAlbumArt } from "./Images/getAlbumArt.js";
import { searchShow } from "./Images/searchShow.js";
import { getMovie } from "./Images/getMovie.js";
import { getAnime } from "./Images/getAnime.js";
import config from "../config.js";
import { processPresence } from "../utils.js";

const { TMDb, myAnimeList, spotify } = config;

let logged = {
  movie: false,
  anime: false,
  spotify: false,
};

async function fetchData(
  reqs: Record<string, any>,
  callback: (...params: any) => Promise<Record<string, any> | null>,
  params: any[],
  message: { type: string; msg: string }
) {
  if (Object.values(reqs).some((req) => !req)) {
    if (!logged[message.type]) {
      // Replace {0} with the requirement key that is null
      const notice = message.msg.replace(
        /{(\d)}/,
        Object.keys(reqs).find((key) => !reqs[key])!
      );
      console.log(notice);
      logged[message.type] = true;
    }
  }

  return await callback(...params);
}

export default async (status: any) => {
  // Initialize variables
  let presence: Record<string, any> = {
    state: null,
    details: null,
    largeImageKey: config.iconNames.vlc,
    largeImageText: null,
    smallImageKey:
      status.state === "playing"
        ? config.iconNames.playing
        : config.iconNames.pause,
    smallImageText: `Volume: ${Math.round(status.volume / 2.56)}%`,
    instance: true,
    endTimestamp: null,
    buttons: null,
    partySize: null,
    partyMax: null,
  };

  // Extract information about what's playing
  const meta = status.information.category.meta;

  // If it's a TV show
  if (meta.showName) {
    // Set the details variable to the name of the show
    presence.details = meta.showName;

    // If there's a season number, append it to the state variable
    if (meta.seasonNumber) {
      presence.state = ` Season ${meta.seasonNumber}`;

      // If there's an episode number, append it to the state variable
      if (meta.episodeNumber) {
        presence.state += ` | Episode ${meta.episodeNumber}`;
      }
    }

    // Try to search for the show and get its image
    const show = await searchShow(meta.showName);
    if (show) presence = { ...presence, ...show };
    // If it's a music video
  } else if (meta.artist) {
    presence.details = meta.title;
    presence.state = meta.artist;

    // If there is an album add it to the state
    if (meta.album) presence.state += ` | ${meta.album}`;

    // If there's a track number and total number of tracks, set the party size and max
    if (meta.track_number && meta.track_total) {
      presence.partySize = parseInt(meta.track_number, 10);
      presence.partyMax = parseInt(meta.track_total, 10);
    }

    // Try to get album art for the music
    const album = await fetchData(
      { clientID: spotify.clientID, clientSecret: spotify.clientSecret },
      getAlbumArt,
      [meta.artist, meta.album],
      {
        type: "spotify",
        msg: "No Spotify {0} provided, skipping Spotify presence",
      }
    );

    if (album) presence = { ...presence, ...album };

    // If the video is currently playing
  } else if (meta.now_playing) {
    // Set the state to  the value of the "now_playing" meta data (if available) or "Stream"
    presence.state = meta.now_playing;
  } else {
    try {
      const anime = await fetchData(
        { clientID: myAnimeList.clientID },
        getAnime,
        [meta.title || meta.filename],
        {
          type: "anime",
          msg: "No MyAnimeList client ID provided, skipping anime presence",
        }
      );

      if (anime) {
        presence = { ...presence, ...anime };
        throw new Error("None");
      }

      const movie = await fetchData(
        { apiKey: TMDb.apiKey },
        getMovie,
        [meta.title || meta.filename],
        {
          type: "movie",
          msg: "No TMDb API key provided, skipping movie presence",
        }
      );
      if (movie) {
        presence = { ...presence, ...movie };
        throw new Error("None");
      }

      const show = await searchShow(meta.title || meta.filename, true);
      if (show) {
        presence = { ...presence, ...show };
        throw new Error("None");
      }

      throw new Error("No data found");
    } catch (error: any) {
      if (error.message !== "None") {
        console.error(error);
        presence.details = meta.filename;
        presence.state = meta.title || "Video";
      }
    }
  }

  // Get time left in video
  const end = Math.floor(
    Date.now() / 1000 + (status.length - status.time) / status.rate
  );
  if (status.state === "playing" && status.length !== 0)
    presence.endTimestamp = end;

  return processPresence(presence);
};
