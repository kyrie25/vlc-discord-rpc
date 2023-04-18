/**
 * Description: Decides what information to display based on the nature of the media (video, music, etc)
 */

const { getAlbumArt } = require("./Images/getAlbumArt.js");
const { searchShow } = require("./Images/searchShow.js");
const { pause } = require("./States/paused.js");
const config = require("../Storage/config.js");

module.exports = async (status) => {
  // Add a pause function so the file does not get too long (makes editing easier as well)
  if (status.state == "paused") {
    var output = pause(status);
  } else {
    const { meta } = status.information.category;

    var output = {
      details: "",
      largeImageKey: image,
      smallImageKey: "playing",
      smallImageText: `Volume: ${Math.round(status.volume / 2.56)}%`,
      instance: true,
    };
    // If it's a video
    if (status.stats.decodedvideo > 0) {
      // If it's a tv show
      if (meta.showName) {
        output.details = meta.showName;
        try {
          const show = await searchShow(meta.showName);
          output.largeImageKey = show.image;
        } catch {
          (await output).largeImageKey = config.iconNames.vlc;
        }
      }

      if (meta.seasonNumber) {
        output.state = ` Season ${meta.seasonNumber}`;
        if (meta.episodeNumber) {
          output.state += ` - Episode ${meta.episodeNumber}`;
        }
      } else if (meta.artist) {
        output.state = meta.artist;
        try {
          var image = await getAlbumArt(meta.album);
        } catch {
          var image = config.iconNames.vlc;
        }
        output.largeImageKey = image;
      } else {
        output.state = `${status.date || ""} Video`;
        output.largeImageKey = config.iconNames.vlc;
      }
    } else if (meta.now_playing) {
      output.state = meta.now_playing || "Stream";
    } else if (meta.artist) {
      output.state = meta.artist;

      if (meta.album) output.state += ` - ${meta.album}`;
      if (meta.track_number && meta.track_total) {
        output.partySize = parseInt(meta.track_number, 10);
        output.partyMax = parseInt(meta.track_total, 10);
      }
    } else {
      output.state = status.state;
    }
    const end = Math.floor(Date.now() / 1000 + (status.length - status.time) / status.rate);
    if (status.state === "playing" && status.length != 0) {
      output.endTimestamp = end;
      output.details = meta.filename;
      output.largeImageKey = config.iconNames.vlc;
    }
  }
  return output;
};
