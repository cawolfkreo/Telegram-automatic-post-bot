"use strict";

const fetch = require("node-fetch");
const { errWithTime } = require("./utils");

const { USER_AGENT, TAGS } = process.env;

const userAgent = USER_AGENT || "nodejs bot in development!";

/**
 * The tags that will always be concatenated
 */
const concatTags = " -type:swf order:random";

/**
 * The tags that will be used for the search
 */
let tags = (TAGS || "wolf score:>=100").concat(concatTags);

/**
 * This is the base url used for making
 * queries to the gallery API.
 */
const baseURL = "https://e621.net";

/**
 * This is the options object for the fetch request
 */
const optionsGet = {
	method: "GET",
	headers: {
		"User-Agent": userAgent
	}
};

/**
 * This is a list of posts, it will
 * be used to store a cache of the
 * future posts the bot is going to
 * use.
 */
const posts = [];

/**
 * Gets the next image post in the list 
 * @param {Number} limit The limit of expected posts
 */
async function getNextPost(limit) {
	if(posts.length === 0){
		try {
			const newPosts = await listOfPosts(limit);
			newPosts.posts.forEach(element => {
				posts.push(element);
			});
		} catch (error) {
			errWithTime(error);
			return Promise.reject("Unable to get post");
		}
	}
	const nextPost = posts.shift();
	nextPost.reference = `${baseURL}/posts/${nextPost.id}`;

	return nextPost;
}

/**
 * Gets gets a list of posts from the gallery with the
 * tags received.
 * @param {Number} limit The limit of expected posts
 * @returns {Promise<object>}
 */
async function listOfPosts(limit){
	const urlToRequest = new URL(`${baseURL}/posts.json?limit=${limit}&tags=${tags}`);
	const response = await fetch(urlToRequest, optionsGet);
	const json = await response.json();
	return json;
}

/**
 * Updates the current list of tags
 * @param {String} newtags the tags used for making posts
 */
function updateTags(newtags){
	tags = newtags.concat(concatTags).split(" ").join("+");
	clearList();
}

/**
 * Clears the current list of posts and
 * makes it an empty one.
 */
function clearList(){
	posts.length = 0;
}

module.exports = {
	getNextPost,
	updateTags,
	getTags: (() => tags)
};