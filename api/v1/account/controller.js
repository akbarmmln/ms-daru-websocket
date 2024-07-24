'use strict';

const rsmg = require('../../../response/rs');
const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid').v4;
const logger = require('../../../config/logger');
const mailer = require('../../../config/mailer');
const adrAccountModel = require('../../../model/adr_account');
const bcrypt = require('bcryptjs');
const saltRounds = 12;
const connectionDB = require('../../../config/db').Sequelize;

exports.getAccount = async function (req, res) {
  try {
    let id = req.body.id;
    const splitId = id.split('-');
    const splitIdLenght = splitId.length
    const partition = splitId[splitIdLenght - 1]

    const tabelAccount = adrAccountModel(partition)

    const dataAccount = await tabelAccount.findOne({
      raw: true,
      where: {
        id: id
      }
    })
    if (!dataAccount) {
      return res.status(200).json(rsmg('10005', null));
    }

    const hasil = {
      dataAccount: dataAccount,
    }
    return res.status(200).json(rsmg(hasil));
  } catch (e) {
    logger.error('error POST /api/v1/account...', e);
    return utils.returnErrorFunction(res, 'error POST /api/v1/account...', e);
  }
}