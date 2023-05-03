// Require modules and configuations
import { spawn } from "child_process";
import * as fs from "fs";
import config from "./config.js";
import { randomPass } from "./utils.js";

// Run the client
import "./modules/client.js";

// Generate a password if needed
config.vlcConfig.password ||= randomPass();

// If windows OS and default path cannot be found try other path
if (
  process.platform == "win32" &&
  !fs.existsSync(config.platformDefaults.win32)
)
  config.platformDefaults.win32 = config.platformDefaults.winalt;

// If VLC path is not specified use the default
const startCommand =
  config.vlcPath ||
  config.platformDefaults[
    process.platform as keyof typeof config.platformDefaults
  ];

// Start the process
const child = spawn(
  startCommand,
  [
    "--extraintf",
    "http",
    "--http-host",
    config.vlcConfig.address,
    "--http-password",
    config.vlcConfig.password,
    "--http-port",
    String(config.vlcConfig.port),
  ],
  {
    stdio: "inherit",
  }
);
// When VLC closes
child.on("exit", () => {
  console.log("VLC closed... exiting program.");
  process.exit(0);
});

// If an error occurs
child.on("error", () => {
  console.log(
    "ERROR: A problem occurred while launching VLC. Make sure the path to VLC is correct in the config.js file. Program will exit after 30 seconds."
  );
  setTimeout(process.exit, 30000, 1);
});
