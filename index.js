const streamrClient = require("streamr-client")
const { Wallet } = require("ethers");
const streamId = 'streamr.eth/demos/helsinki-trams'
var count = 0
const main = async () => {
    isValidPrivateKey(privateKey)
    const client = new StreamrClient({
        auth: {
          privateKey: privateKey,
        },
      });
      console.log("client created");
    
      // Create the default stream
      const stream = await client.getOrCreateStream({
        id: streamId,
      });
    
    console.log("Start Counting")
    streamr.subscribe(streamId, (message) => {
        console.log(count++)
    })    
}
isValidPrivateKey: (privateKey) => {
    try {
      const w = new Wallet(privateKey);
    } catch (e) {
      console.error(
        "You need to provide a Private Key under /src/config.js before you can execute this example."
      );
      process.exit(1);
    }
  }
