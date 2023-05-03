/**
 * Description: Decides what information to display based on the nature of the media (video, music, etc)
 */

import { getAlbumArt } from "./Images/getAlbumArt.js";
import { searchShow } from "./Images/searchShow.js";
import { getMovie } from "./Images/getMovie.js";
import { getAnime } from "./Images/getAnime.js";
import config from "../config.js";
import { processPresence } from "../utils.js";

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
    // Try to get the album art for the music
    const album = await getAlbumArt(meta.album, meta.artist);
    if (album) presence = { ...presence, ...album };

    // If the video is currently playing
  } else if (meta.now_playing) {
    // Set the state to  the value of the "now_playing" meta data (if available) or "Stream"
    presence.state = meta.now_playing;
  } else {
    try {
      const movie = await getMovie(meta.title || meta.filename);
      if (movie) {
        presence = { ...presence, ...movie };
        throw new Error("None");
      }

      const anime = await getAnime(meta.title || meta.filename);
      if (anime) {
        presence = { ...presence, ...anime };
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
