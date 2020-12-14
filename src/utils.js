"use strict";

/**
 * The current time formated to the format:
 * dd/mm/yy-hh:mm:ss a.m/p.m
 */
function getFormatedTime() {
	const acualTime = new Date();
	return acualTime.toLocaleString().replace(", ", "-").slice(0,-1);
}

/**
 * Prints a log with the current time
 * @param {String} message the message to print
 */
function logWithTime( message ){
	const logTime = getFormatedTime();
	console.log(`[${logTime}] ${message}`);
}

/**
 * prints an error message with the current time
 * @param {String} message the error message to print
 */
function errWithTime ( message ) {
	const logTime = getFormatedTime();
	console.error(`[${logTime}] ${message}`);
}

module.exports = {
	logWithTime,
	errWithTime
};