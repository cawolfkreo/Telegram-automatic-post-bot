"use strict";

/** ==================================
*              IMPORTS
=================================== */
require("dotenv").config();

const { TELEGRAM } = process.env;

if (!TELEGRAM) {
	console.error("Error: no TELEGRAM variable in enviorenment.\nPerhaps you forgot to include it?");
	process.exit(1);
}