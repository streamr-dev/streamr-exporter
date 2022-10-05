const StreamrClient = require("streamr-client")
const client = require('prom-client');
const express = require("express")
const flatten = require("flat")


class StreamrExporter {
  constructor() {

    this.app = express()
    this.port = 3000


    // this.collectDefaultMetrics = client.collectDefaultMetrics;
    // const Registry = client.Registry;
    // const register = new Registry();
    // this.collectDefaultMetrics({ register });
    this.helsinki_trams_message_count = new client.Counter({
      name: 'helsinki_trams_message_count',
      help: 'Counts messages arriving to the streamr.eth/demos/helsinki-trams stream',
    });
    this.guages = []
    // this.guages["network_metrics"] = new client.Gauge({ name: 'network_metrics', help: 'streamr network info' });
    // this.guages["DATA_metadata"] = new client.Gauge({ name: 'DATA_metadata', help: 'metadata about data token' });
    // this.guages["binance_ticker"] = new client.Gauge({ name: 'binance_ticker', help: 'streamr DATA binance ticker' });
    // counter.inc(); // Increment by 1
    // counter.inc(10); // Increment by 10
    // gauge.set(10); // Set to 10
    // gauge.inc(); // Increment 1
    // gauge.inc(10); // Increment 10
    // gauge.dec(); // Decrement by 1
    // gauge.dec(10); // Decrement by 10
    this.helsinki_trams = 'streamr.eth/demos/helsinki-trams'
    this.network_metrics = 'streamr.eth/metrics/network/sec'
    this.DATA_metadata = '0x7d275b79eaed6b00eb1fe7e1174c1c6f2e711283/DATA-metadata'
    this.binance_ticker = 'binance-streamr.eth/DATAUSDT/ticker'
    this.count = 0
    this.streamr = new StreamrClient();
  }
  main = async () => {
    console.log("Start suscription")
    this.streamr.subscribe(this.helsinki_trams, (message) => {
      this.helsinki_trams_message_count.inc()
    })
    this.streamr.subscribe(this.network_metrics, (message) => {
      this.proccessMetric(message,"network_metrics_");
    })
    this.streamr.subscribe(this.DATA_metadata, (message) => {
      this.proccessMetric(message,"DATA_metadata_");
    })
    this.streamr.subscribe(this.binance_ticker, (message) => {
      this.proccessMetric(message,"binance_ticker_");
    })
    this.app.listen(this.port, () => {
      console.log(`Listening on port ${this.port}`)
    })
  }
  routes = async () => {
    this.app.get('/metrics', async (req, res) => {
      let metrics = await client.register.metrics()
      console.log("Metrics", metrics);
      let metricsContentType = client.register.contentType
      res.contentType(metricsContentType)
      res.send(metrics)
    })
  }

  proccessMetric(message,guage_name_prefix) {
    try {
      console.log(guage_name_prefix, message);
      let metrics = flatten(message, {
        delimiter: "_",
        object: true,
        transformKey: function (key) {
          key = key.replace(/^("|')(.*)("|')$/, '');
          key = key.replaceAll('-', '_');
          return key;
        }
      });
      console.log(metrics);
      for (const [metric_name, metric_value] of Object.entries(metrics)) {
        console.log("Metric name type", metric_name, typeof (metric_name));
        if (!this.guages[guage_name_prefix + metric_name]) {
          this.guages[guage_name_prefix + metric_name] = new client.Gauge({ name: guage_name_prefix + metric_name, help: guage_name_prefix + metric_name });
          this.guages[guage_name_prefix + metric_name].set(Number(metric_value));
        } else {
          this.guages[guage_name_prefix + metric_name].set(Number(metric_value));
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
const streamExporter = new StreamrExporter()
streamExporter.routes()
streamExporter.main()