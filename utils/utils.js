const logger = require('../config/logger');
const errMsg = require('../error/resError');

exports.returnErrorFunction = function (resObject, errorMessageLogger, errorObject) {
  if (errorObject instanceof BaseError) {
    return resObject.status(errorObject.statusCode).json(errMsg(errorObject.errorCode, errorObject.description, errorObject?.errorDetails));
  } else {
    return resObject.status(500).json(errMsg('70000'));
  }
};
