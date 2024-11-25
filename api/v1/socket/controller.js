'use strict';

const logger = require('../../../config/logger');
const errMsg = require('../../../error/resError');
const rsMsg = require('../../../response/rs');
const adrConnectionTable = require('../../../model/adr_connection_table')
const uuidv4 = require('uuid').v4;
const moment = require('moment');

exports.createClient = async function(clientId) {
    await adrConnectionTable.create({
        id: uuidv4(),
        created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
        created_by: 'SYSTEM',
        modified_dt: null,
        modified_by: null,
        client_id: clientId
    })
}

exports.create = async function (req, res) {
    try {
        const clientId = req.body.clientId;
        await exports.createClient(clientId);
        return res.status(200).json(rsMsg('000000'))
    } catch (e) {
        logger.errorWithContext({ error: e, message: 'error POST /api/v1/socket/create...' });
        return utils.returnErrorFunction(res, 'error POST /api/v1/socket/create...', e);
    }
}