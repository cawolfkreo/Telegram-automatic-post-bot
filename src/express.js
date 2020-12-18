"use strict";
const { getTags } = require("./galleryWrapper");
const { logWithTime } = require("./utils");
const { version, name } = require("./../package.json");
const express = require("express");

const { PORT } = process.env;

const portToUse = PORT || 8080;

const app = express();


app.get("/", (req, res) => {
	res.send({
		name,
		currentTags: getTags(),
		version,
	});
});

/**
 * Starts the Express.js web server
 * in order to make it listen for
 * http connections on the PORT given
 * on the ENV variable
 */
function startServer() {
	app.listen(portToUse, () => {
		logWithTime(`Express js server ready and listening on port: ${portToUse}.`);
	});
}


module.exports = {
	app,
	startServer
};