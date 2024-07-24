'use strict';

const rsmg = require('../../../response/rs');
const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid').v4;
const logger = require('../../../config/logger');
const formats = require('../../../config/format');
const mailer = require('../../../config/mailer');
const adrVerifikasi = require('../../../model/adr_verifikasi');
const adrLogin = require('../../../model/adr_login');
const bcrypt = require('bcryptjs');
const saltRounds = 12;
const connectionDB = require('../../../config/db').Sequelize;
const axios = require('axios');
const {fire} = require("../../../config/firebase");
const firestore = fire.firestore();

exports.getSample = async function (req, res) {
  try {
    return res.status(200).json(rsmg('000000', {}));
  } catch (e) {
    logger.error('error POST /api/v1/account...', e);
    return utils.returnErrorFunction(res, 'error POST /api/v1/account...', e);
  }
}