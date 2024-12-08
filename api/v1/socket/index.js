const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/create', controller.create);
router.post('/delete', controller.delete);

router.post('/create-socket-service', controller.socketCreate);

module.exports = router;