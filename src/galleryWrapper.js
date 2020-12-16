"use strict";

const fetch = require("node-fetch");

const { logWithTime, errWithTime } = require("./utils");

const { USER_AGENT } = process.env;

const userAgent = USER_AGENT || "nodejs bot in testing";

/**
 * This is the options object for the fetch request
 */
const optionsGet = {
	method: "GET",
	headers: {
		"User-Agent": userAgent
	}
};

async function test(){
	logWithTime("before calling...");
	try {
		const response = await fetch("https://www.e926.net/posts.json?limit=2&tags=wolf", optionsGet);
		const json = await response.json();
		logWithTime(JSON.stringify(json));
	} catch (error) {
		errWithTime(error);
	}
}

test();