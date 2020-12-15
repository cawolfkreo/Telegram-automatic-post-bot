"use strict";

const { logWithTime, errWithTime } = require("./utils");
const { Telegraf, Extra } = require("telegraf");

const { TOTAL_MESSAGES } = process.env;

/**
* This variable stores the interval ID for the bot
* automatic message post.
* @type {NodeJS.Timeout}
*/
let intervalID;

/**
* This is the reference to the local storage object.
* @type {Store}
*/
let store;

/**
 * The total messages the bot will post when it updates
 */
let totalMessg = Number.parseInt(TOTAL_MESSAGES) || 7;

/**
* Starts the telegram bot. 
* @param {String} TELEGRAM_TOKEN The telegram token for the bot
* @param {Number} TIME The time in seconds between each automatic message of the bot
* @param {Store} localStorage The storage for the bot
*/
async function startBot( TELEGRAM_TOKEN, TIME, localStorage ) {
	const bot = new Telegraf(TELEGRAM_TOKEN);

	bot.command("about", about);
	
	bot.command("ping", ping);

	bot.command("time", changeTime);

	bot.command("totalPosts", numberOfMsgsToPost);
	
	bot.on("message", messageHandler);
	
	store = localStorage;
	
	try {
		await bot.launch();
		intervalID = setTelegramInterval(bot.telegram, TIME);
	} catch (error) {
		errWithTime(error);
		clearInterval(intervalID);
	}
}

/**
* Handles received messages.
* @param {TelegrafContext} ctx Te telegraf context object.
*/
function messageHandler( ctx ) {
	const chatType = ctx.message.chat.type;
	const chatID = ctx.message.chat.id;
	logWithTime(`Received a message from: ${ctx.message.chat.id}! with type: ${chatType}`);
	if(chatType === "group" || chatType === "channel" || chatType === "supergroup") {
		ctx.session = true;
		const currentChat = store.get("chats") || {}; //get the "chats" object or create a new one.
		currentChat[chatID] = true;
		store.set("chats", currentChat);
	}
}

/**
 * Handles the "about" command.
 * @param {TelegrafContext} ctx the telegraf context object.
 */
function about(ctx) {
	const message = "Hello, this bot posts an automatic message every X seconds (X is a variable amount ".concat(
		"that depends on how am I being configured).\n",
		`The automatic message is also sent ${totalMessg} number of times when the time is over.\n`,
		"My source code is private, sorry 😭😭."
	);

	ctx.reply(message, Extra.inReplyTo(ctx.message.message_id));
}

/**
* Handles the "ping" commad.
* @param {TelegrafContext} ctx the telegraf context object.
*/
function ping( ctx ) {
	ctx.reply("Pong!", Extra.inReplyTo(ctx.message.message_id));
}

/**
 * Handles the "time" command for changing the time
 * between posts.
 * @param {TelegrafContext} ctx the telegraf context object.
 */
async function changeTime({ message, telegram, from, getChatMember, reply}) {
	const newTime = await validateNumberCommand(getChatMember, message.text, reply, from.id, message.message_id);

	if(newTime){
		if(newTime > 40){
			stopInterval();
			intervalID = setTelegramInterval(telegram, newTime);
			reply(`I will now post every ${newTime} seconds! 😁`, Extra.inReplyTo(message.message_id));
			logWithTime(`Messages are now being posted every: ${newTime} seconds`);
		} else {
			reply(`Sorry but ${newTime} seconds could lead to constant spam by my part. Please choose a bigger time.`, Extra.inReplyTo(message.message_id));
		}
	}
}

/**
 * Handles the "totalPosts" command
 * @param {TelegrafContext} ctx the telegraf context object.
 */
async function numberOfMsgsToPost({ message, from, getChatMember, reply}) {
	const newTotal = await validateNumberCommand(getChatMember, message.text, reply, from.id, message.message_id);

	if(newTotal){
		if(newTotal <= 0 || newTotal >= 10){
			totalMessg = newTotal;
			reply(`I will now post ${totalMessg} messages! 😉`, Extra.inReplyTo(message.message_id));
			logWithTime(`Now the bot posts ${totalMessg} messages at once`);
		} else {
			reply("Sorry but I cannot send that ammount of messages each time!");
		}
	}
}

/**
 * validates the command issuer is allowed to use it as well as making
 * sure the first argument can be parsed into an integer.
 * @param {Promise<import("telegraf/typings/telegram-types").ChatMember>} getChatMember 
 * @param {String} text
 * @param {Function} reply 
 * @param {Number} userid
 * @param {Number} message_id 
 */
async function validateNumberCommand(getChatMember, text, reply, userid, message_id){
	const [, ...args] = text.split(" ");
	const chatMember = await getChatMember(userid);

	if(isThisMemberAllowed( chatMember )) {
		try {
			const argument = Number.parseInt(args[0]);

			if(isNaN(argument)){
				throw "Parse Error: Expected a number but received NaN after parsing";
			}

			return argument;
		} catch (error) {
			errWithTime(`Expected a number to change the time but the args received were: ${JSON.stringify(args)}`);
			reply("I was expecting a number after the command 😢", Extra.inReplyTo(message_id));
		}
	} else {
		reply("You are not allowed to use that command!! 😡", Extra.inReplyTo(message_id));
	}

	return null;
}

/**
 * Checks if a chat member is an admin or owner of a channel.
 * @param {import("telegraf/typings/telegram-types").ChatMember} chatMember The telegram chat member
 */
function isThisMemberAllowed( chatMember ) {
	return chatMember.status === "creator" ||chatMember.status === "administrator";
}

/**
 * Clears the interval responsible for posting on telegram.
 */
function stopInterval() {
	clearInterval(intervalID);
	intervalID = null;
}

/**
* Creates the interval that is called every X mili-seconds
* to automatically send messages to telegram
* @param {Telegram} telegram The current telegram instance
* @param {Number} time The time in seconds between each call.
*/
function setTelegramInterval(telegram, time) {
	const intervalFunction = () => {
		try {
			sendMessagesToChat(telegram);
		} catch (error) {
			errWithTime(error);
			clearImmediate(intervalID);
		}
	};
	
	intervalFunction(); // The interval function is called immediatelly for testing purposes.
	return setInterval(intervalFunction, time * 1000);
}

/**
 * Sends the messages to all the chats the bot currently has
 * on it's list.
 * @param {Telegram} telegram The current telegram instance
 */
function sendMessagesToChat(telegram){
	const chats = store.get("chats")|| {};
	for (const chat in chats) {
		
		for (let index = 0; index < totalMessg; ++index) {
			telegram.sendMessage(chat, "Este es un mensaje automático");
		}
	}
}

module.exports = {
	startBot
};