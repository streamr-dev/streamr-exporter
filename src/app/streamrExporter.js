
const express = require("express")
const pino = require("pino")
const http = require('http')
const rest = require("../rest")
const {MetricsService} = require("./metricsService")


class StreamrExporter {
  constructor({
    logLevel = 'info',
    port = 9099,
    expressApp = express(),
		httpServer = undefined,
    logger = pino({
			name: 'main',
			level: logLevel,
		})
  }) {
    this.expressApp = expressApp
    this.logger = logger
    this.port = port
    if (!httpServer) {
			const httpServerOptions = {
				maxHeaderSize: 4096,
			}
			httpServer = http.createServer(httpServerOptions, expressApp)
		}
		this.httpServer = httpServer
    
    this.metricsService = new MetricsService(this.logger)
  }
  listen(){
    this.routes()
    this.expressApp.listen(this.port, () => {
      this.logger.info(`Listening on port ${this.port}`)
  })
  }
  close() {
    this.metricsService.close()
    Object.keys(signals).forEach((signal) => {
        process.removeAllListeners(signal)
    })
    if (!this.server) {
        return
    }
    return new Promise((done, fail) => {
        this.server.close((err) => {
            if (err) {
                fail(err)
            }
            done()
        })
    })
}
  
  routes = async () => {
    this.expressApp.use(express.json({
      limit: '1kb',
    }))
    const metricsHandler = new rest.metricsHandler(this.logger, this.metricsService)
    this.expressApp.get('/metrics', async (req, res) => { 
        await metricsHandler.handle(req, res)
    })
  this.expressApp.use(rest.error(this.logger))
    
  }
}
module.exports = {
  StreamrExporter,
}