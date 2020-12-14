"use strict";

require("dotenv").config();
const { logWithTime } = require("./src/utils");

const { TELEGRAM } = process.env;

if (!TELEGRAM) {
	console.error("Error: no TELEGRAM variable in enviorenment.\nPerhaps you forgot to include it?");
	process.exit(1);
}

const { startBot } = require("./src/telegram");
startBot(TELEGRAM);

logWithTime("Bot is up!");