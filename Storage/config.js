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
  id: "",
  updateInterval: 500,
  removeAfter: 5000,
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

// Local VLC Config
const vlcConfig = {
  password: "",
  port: 8080,
  address: "localhost",
};

// Modules to load
module.exports = { platformDefaults, vlcPath, richPresenseSettings, vlcConfig, spotify, iconNames };
