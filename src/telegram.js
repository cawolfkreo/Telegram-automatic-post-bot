"use strict";

const { logWithTime, errWithTime } = require("./utils");
const { Telegraf, Extra } = require("telegraf");

const { TOTAL_MESSAGES } = process.env;

/**
* This variable stores the interval ID for the bot
* automatic message post.
*/
let intervalID;

/**
* This is the reference to the local storage object.
* @type {Store}
*/
let store;

/**
* Starts the telegram bot. 
* @param {String} TELEGRAM_TOKEN The telegram token for the bot
* @param {Number} TIME The time in seconds between each automatic message of the bot
* @param {Store} localStorage The storage for the bot
*/
async function startBot( TELEGRAM_TOKEN, TIME, localStorage ) {
	const bot = new Telegraf(TELEGRAM_TOKEN);
	
	bot.command("ping", ping);
	
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
* Handles the "ping" commad.
* @param {TelegrafContext} ctx the telegraf context oject.
*/
function ping( ctx ) {
	ctx.reply("Pong!", Extra.inReplyTo(ctx.message.message_id));
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
	return setInterval(intervalFunction,time * 1000);
}

function sendMessagesToChat(telegram){
	const chats = store.get("chats")|| {};
	for (const chat in chats) {
		const totalMessg = TOTAL_MESSAGES || 7;
		
		for (let index = 0; index < totalMessg; ++index) {
			telegram.sendMessage(chat, "Este es un mensaje automático");
		}
	}
}

module.exports = {
	startBot
};