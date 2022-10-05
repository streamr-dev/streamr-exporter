
  const { ErrorMessage } = require('./ErrorMessage')

  class metricsHandler {
      constructor(logger, metricsService) {
          this.logger = logger
          this.metricsService = metricsService
      }
  
      sendResponse(res, status, response, responseType) {
          res.set('content-type', responseType)
          res.status(status)
          res.send(response)
      }
  
      sendJsonError(res, status, message) {
          const errorMessage = new ErrorMessage(message)
          this.sendJsonResponse(res, status, errorMessage)
      }
  
      async handle(req, res) {
          try {
              this.logger.debug("Requesting for a handle")
              const {metrics,metricsContentType} = await this.metricsService.getMetrics()
              this.logger.debug("Response from get metrics function",metrics)
              this.sendResponse(res, 200, metrics, metricsContentType)
          } catch (err) {
              this.logger.error(err)
              this.sendJsonError(res, 400, err.message)
          }
      }
  }
  
  module.exports = {
      metricsHandler,
  }