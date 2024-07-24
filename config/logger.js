'use strict';
require('dotenv').config();
const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = process.env.LOGGING_LEVEL ? process.env.LOGGING_LEVEL : 'debug';
module.exports = logger;