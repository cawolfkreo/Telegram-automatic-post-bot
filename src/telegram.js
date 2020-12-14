"use strict";

const { logWithTime } = require("./utils");
const { Telegraf, Extra } = require("telegraf");
const LocalSession = require("telegraf-session-local");

/**
 * Starts the telegram bot. 
 * @param {String} TELEGRAM_TOKEN The telegram token for the bot
 */
function startBot( TELEGRAM_TOKEN ) {
	const bot = new Telegraf(TELEGRAM_TOKEN);

	bot.use(new LocalSession({ database: "bot_db.json"}).middleware());

	bot.command("ping", ping);

	bot.on("message", messageHandler);

	bot.launch();
}

/**
 * Handles received messages.
 * @param {TelegrafContext} ctx Te telegraf context object.
 */
function messageHandler( ctx ) {
	ctx.session.list = ctx.session.list || new Set();

	logWithTime(`Received a message from: ${ctx.message.chat.id}!`);
}

/**
 * Handles the "ping" commad.
 * @param {TelegrafContext} ctx the telegraf context oject.
 */
function ping( ctx ) {
	ctx.reply("Pong!", Extra.inReplyTo(ctx.message.message_id));
}

module.exports = {

	startBot
};