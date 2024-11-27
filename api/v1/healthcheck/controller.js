'use strict';

const logger = require('../../../config/logger');
const errMsg = require('../../../error/resError');
const rsMsg = require('../../../response/rs');
let health = { serverOk: false, dbOk: false };

exports.healtyCheck = async function (req, res) {
    health.serverOk = true;
    let asynccc = await updateHealthResponse();
    if (asynccc == 200) {
        return res.status(200).json(rsMsg('000000'));
    } else {
        return res.status(500).json(errMsg('01000'));
    }
}

async function updateHealthResponse() {
    const isReady = true

    if (isReady) {
        logger.infoWithContext('[MS-DARU-WEBSOCKET] - Ready to serve traffic');
        return 200;
    } else {
        logger.infoWithContext('[MS-DARU-WEBSOCKET] - Unable to serve traffic');
        return 500
    }
}