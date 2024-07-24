const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/sample', controller.getSample);

module.exports = router;