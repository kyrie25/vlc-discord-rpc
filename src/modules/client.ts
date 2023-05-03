import * as RPC from "discord-rpc";
import config from "../config.js";
import diff from "./status.js";
import format from "./rpc-format.js";

const client = new RPC.Client({ transport: "ipc" });
let awake = true;
let timeInactive = 0;

async function update() {
  diff(async (status, shouldUpdate) => {
    if (shouldUpdate) {
      const formatted = await format(status);
      client.setActivity(formatted);

      if (!awake) {
        awake = true;
        timeInactive = 0;
      }
    } else if (awake) {
      if (status.state !== "playing") {
        timeInactive += config.richPresenseSettings.updateInterval;
        if (
          (config.richPresenseSettings.removeAfter !== 0 &&
            timeInactive >= config.richPresenseSettings.removeAfter) ||
          status.state === "stopped"
        ) {
          console.log("VLC not playing; going to sleep.", true);
          awake = false;
          client.clearActivity();
        } else {
          const formattedStatus = await format(status);
          client.setActivity(formattedStatus);
          awake = false;
        }
      }
    }
  });
}

client.on("ready", () => {
  console.log("Logged in as", client.user!.username);
});

async function connectToDiscord() {
  try {
    console.log("Connecting to Discord...");
    await client.login({ clientId: config.richPresenseSettings.id });
    setInterval(update, config.richPresenseSettings.updateInterval);
  } catch (error: any) {
    if (error.toString() === "Error: Could not connect") {
      console.log(
        "Failed to connect to Discord. Is your Discord client open? Retrying in 20 seconds..."
      );
      // Retry login
      setTimeout(connectToDiscord, 20000);
    } else {
      console.log("An unknown error occurred when connecting to Discord");
      throw error;
    }
  }
}
connectToDiscord();
