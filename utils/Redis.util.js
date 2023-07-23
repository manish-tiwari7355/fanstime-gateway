const {createClient} = require('redis');

let client;

(async () => {
    client = createClient({
        url: process.env.REDIS_URL,
      });
    await client.connect();
})()

module.exports = client;