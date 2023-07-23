const { MongoClient } = require("mongodb");
// Connection URI

// Create a new MongoClient
const { database } = require("../config/keys");
const client = new MongoClient(database);
let masterDBClient;

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Establish and verify connection
    masterDBClient = client.db("test");
    await masterDBClient.command({ ping: 1 });
    console.log("Connected successfully to server");
  } catch {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

module.exports = {
  mongoClient: client,
  masterDBClient,
};
