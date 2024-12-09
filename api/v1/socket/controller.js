'use strict';

const rsmg = require('../../../response/rs');
const logger = require('../../../config/logger');
const errMsg = require('../../../error/resError');
const rsMsg = require('../../../response/rs');
const adrConnectionTable = require('../../../model/adr_connection_table')
const uuidv4 = require('uuid').v4;
const moment = require('moment');
const utils = require('../../../utils/utils');
const ApiErrorMsg = require('../../../error/apiErrorMsg')
const HttpStatusCode = require("../../../error/httpStatusCode");
const redisClient = require('../../../config/redis');

exports.createClient = async function (clientId) {
  try {
    await adrConnectionTable.create({
      id: uuidv4(),
      created_dt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      created_by: 'SYSTEM',
      modified_dt: null,
      modified_by: null,
      client_id: clientId
    })
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error create client socket' });
  }
}

exports.deleteClient = async function (clientId) {
  try {
    await adrConnectionTable.destroy({
      where: { client_id: clientId }
    });
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error delete client socket' });
  }
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

exports.delete = async function (req, res) {
  try {
    const clientId = req.body.clientId;
    await exports.deleteClient(clientId);
    return res.status(200).json(rsMsg('000000'))
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error POST /api/v1/socket/create...' });
    return utils.returnErrorFunction(res, 'error POST /api/v1/socket/create...', e);
  }
}


exports.socketCreate = async function (req, res) {
  try {
    if (!req.body || !Array.isArray(req.body.data) || !req.body.data.length) {
      throw new ApiErrorMsg(HttpStatusCode.BAD_REQUEST, '70001');
    }

    const CLIENTS_KEY = 'available_socket'
    const arrayData = req.body.data;
    let totalData = 0;
    for (const ele of arrayData) {
      let service = ele.service
      let podsName = ele.podsName;
      let pods = ele.pods;
      let socketName = ele.socketName;

      let payload = {
        service: service,
        podsName: podsName,
        pods: pods,
        socketName: socketName
      }

      await redisClient.hset(CLIENTS_KEY, `${service}-${pods}`, JSON.stringify(payload));
      totalData++;
      if (totalData > 5) {
        break;
      }
    }

    return res.status(200).json(rsmg('000000'))
  } catch (e) {
    logger.errorWithContext({ error: e, message: 'error GET /api/v1/train/coba...' });
    return utils.returnErrorFunction(res, 'error GET /api/v1/train/coba...', e);
  }
}