const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/healty', controller.healtyCheck);

router.get('/socket', controller.socket);

module.exports = router;