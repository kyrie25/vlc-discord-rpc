// Where to look for VLC
const platformDefaults = {
  win32: "C:/Program Files/VideoLAN/VLC/vlc.exe",
  winalt: "C:/Program Files (x86)/VideoLAN/VLC/vlc.exe",
  linux: "/usr/bin/vlc",
  unix: "/usr/bin/vlc",
  darwin: "/Applications/VLC.app/Contents/MacOS/VLC",
};

// Is VLC somewhere else?
const vlcPath = "";

// Settings
const richPresenseSettings = {
  /**
   * By default this will be displayed as "VLC Media Player".
   * If you wish to change it, create a new application at https://discordapp.com/developers/applications/ and paste the client ID here.
   */
  id: "1102445158341034135",
  updateInterval: 500,
  // How long to wait before removing the presence after VLC closes. (ms)
  // 0 = Never remove
  removeAfter: 0,
};

// Default icons. Change if you would like.
const iconNames = {
  pause: "https://i.imgur.com/CCg9fxf.png",
  playing: "https://i.imgur.com/8IYhOc2.png",
  vlc: "https://i.imgur.com/7CRaCeT.png",
};

// Must fill these out for album covers
const spotify = {
  clientID: "",
  clientSecret: "",
};

// Must fill these out for movie posters
const TMDb = {
  apiKey: "",
};

// Must fill these out for anime posters
const myAnimeList = {
  clientID: "",
};

// Local VLC Config
const vlcConfig = {
  password: "",
  port: 8080,
  address: "localhost",
};

// Do you want it to log every time your presence is updated? (Useful for debug)
const logUpdates = false;

// Modules to load
export default {
  platformDefaults,
  vlcPath,
  richPresenseSettings,
  vlcConfig,
  spotify,
  TMDb,
  myAnimeList,
  iconNames,
  logUpdates,
};
