# VLC-Discord-Rich-Presence

Discord rich presence for VLC media player.

A fork of [vlc-rpc/rpc-discord-rpc](https://github.com/vlc-rpc/vlc-discord-rpc) (Originally [Pigpog/vlc-discord-rpc](https://github.com/Pigpog/vlc-discord-rpc)), rewritten in TypeScript and refactored for my own personal preferences and usage.

In addition to the original features, I've added movie and anime presence support, while also expanding on what the presence displays

![image](https://i.imgur.com/VvTSTi7.png)
![image](https://i.imgur.com/E8RNVO2.png)
![image](https://i.imgur.com/D4mqrwh.png)

## Setup

1. Clone this repository.
2. Install [Node.js](https://nodejs.org/en/download).
3. Configure the `./src/config.ts` file to your liking.

- For fetching track metadata, retrieve your [Spotify API key](https://developer.spotify.com/documentation/web-api/tutorials/getting-started). You'll need to fill in `clientID` and `clientSecret`.
- For fetching the Movie metadata, create a TMDb account and retrieve your API key from [here](https://www.themoviedb.org/settings/api). You'll need to fill in `API Key (v3 auth)` to the `apiKey` parameter.
- For fetching the Anime metadata, create a MyAnimeList account and retrieve your API key from [here](https://myanimelist.net/apiconfig). You'll need to fill in `Client ID` to the `clientId` parameter.

4. Open a terminal, move to the folder you downloaded from this repository, and run `npm i` to install dependencies.
5. Run `npm run build` to build the project, then run `npm start` to start the program.

**Note:** Every time you want to change the configuration, you'll need to do step 5 again.
