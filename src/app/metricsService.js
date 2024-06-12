const {StreamrClient} = require("@streamr/sdk")
const client = require('prom-client');
const flatten = require("flat")
class MetricsService {
    constructor(logger) {
        if (logger === undefined) {
            throw new Error(`Variable logger is required`)
        }
        this.logger = logger
        this.helsinki_trams_message_count = new client.Counter({
            name: 'streamr_helsinki_trams_message_count',
            help: 'Counts messages arriving to the streamr.eth/demos/helsinki-trams stream',
        });
        this.guages = []
        this.helsinki_trams = 'streamr.eth/demos/helsinki-trams'
        this.network_metrics = 'streamr.eth/metrics/network/sec'
        this.DATA_metadata = '0x7d275b79eaed6b00eb1fe7e1174c1c6f2e711283/DATA-metadata'
        this.binance_ticker = 'binance-streamr.eth/DATAUSDT/ticker'
        this.count = 0
        try {
          this.streamr = new StreamrClient();
          this.logger.debug("Start subscription")
          this.streamr.subscribe(this.helsinki_trams, (message) => {
              // this.logger.debug(message)
              this.helsinki_trams_message_count.inc()
          })
          this.streamr.subscribe(this.network_metrics, (message) => {
              this.proccessMetric(message, "streamr_network_metrics_");
          })
          this.streamr.subscribe(this.DATA_metadata, (message) => {
              this.proccessMetric(message, "streamr_DATA_metadata_");
          })
          this.streamr.subscribe(this.binance_ticker, (message) => {
              this.proccessMetric(message, "streamr_binance_ticker_");
          })
        } catch (error) {
          logger.error("Error in subscribtion : "+error)
        }

    }

    async getMetrics(){
        let metrics = await client.register.metrics()
        this.logger.debug("Getting Metrics", metrics);
        let metricsContentType = client.register.contentType
        return {metrics,metricsContentType}
    }
    close(){
        this.streamr.unsubscribe()
    }
    proccessMetric(message,guage_name_prefix) {
        try {
          this.logger.debug(guage_name_prefix, message);
          let metrics = flatten(message, {
            delimiter: "_",
            object: true,
            transformKey: function (key) {
              key = key.replaceAll('-', '_');
              key = key.replaceAll('.', '_');
              key = key.replace(/^("|')(.*)("|')$/, '');
              return key;
            }
          });
          this.logger.debug("Metrics Object is: ");
          this.logger.debug(metrics);
          for (const [metric_name, metric_value] of Object.entries(metrics)) {
            if (metric_name == null || metric_name == "" || metric_name == undefined) {
              continue;
              }
            this.logger.debug("Metric name type " + metric_name + typeof (metric_name));
            if (!this.guages[guage_name_prefix + metric_name]) {
              this.guages[guage_name_prefix + metric_name] = new client.Gauge({ name: guage_name_prefix + metric_name, help: guage_name_prefix + metric_name });
              this.guages[guage_name_prefix + metric_name].set(Number(metric_value));
            } else {
              this.guages[guage_name_prefix + metric_name].set(Number(metric_value));
            }
          }
        } catch (error) {
          this.logger.error("ERROR OCCURED in creating or setting guage : " + error + " : " + error.stack);
          throw error
        }
      }
}
module.exports = {
    MetricsService
}