const customLogger = require('./requestLogger')
const Config = require('../lib/config')
const axios = require('axios').default

const handleCallback = async (callbackObject, context, req) => {
  if (callbackObject.delay) {
    await new Promise(resolve => setTimeout(resolve, callbackObject.delay))
  }

  // Validate callback against openapi
  const validationResult = await context.api.validateRequest(callbackObject)
  if (validationResult.valid) {
    customLogger.logMessage('info', 'Callback schema is valid ' + callbackObject.method + ' ' + callbackObject.path, null, true, req)
  } else {
    customLogger.logMessage('error', 'Callback schema is invalid ' + callbackObject.method + ' ' + callbackObject.path, validationResult.errors, true, req)
  }

  // Send callback
  if (Config.USER_CONFIG.SEND_CALLBACK_ENABLE) {
    customLogger.logMessage('info', 'Sending callback ' + callbackObject.method + ' ' + callbackObject.path, callbackObject, true, req)
    axios({
      method: callbackObject.method,
      url: Config.USER_CONFIG.CALLBACK_ENDPOINT + callbackObject.path,
      headers: callbackObject.headers,
      data: callbackObject.body,
      timeout: 3000
    }).then((result) => {
      customLogger.logMessage('info', 'Received callback response ' + result.status + ' ' + result.statusText, null, true, req)
    }, (err) => {
      customLogger.logMessage('error', 'Failed to send callback ' + callbackObject.method + ' ' + callbackObject.path, err, true, req)
    })
  } else {
    customLogger.logMessage('info', 'Log callback ' + callbackObject.method + ' ' + callbackObject.path, callbackObject, true, req)
  }
}

module.exports.handleCallback = handleCallback
