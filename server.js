"use strict";

require("dotenv").config();
const { logWithTime, errWithTime } = require("./src/utils");
const { startBot } = require("./src/telegram");
const store = require("data-store");
const { TELEGRAM, TIME, STORE } = process.env;
const time = TIME || 300;
const storePath = STORE || "db.json";

const localStorage = store({path: storePath});

if (!TELEGRAM) {
	errWithTime("Error: no TELEGRAM variable in enviorenment.\nPerhaps you forgot to include it?");
	process.exit(1);
}

startBot(TELEGRAM, Number.parseInt(time), localStorage);

logWithTime("Bot is up!");