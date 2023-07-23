module.exports = {
  WS_SOCKET_USER: "WS_SOCKET_USER",
  MESSAGE_QUEUE: "MESSAGE_QUEUE",
  MESSAGE_QUEUE_GROUP: "MESSAGE_QUEUE_GROUP",
  MESSAGE_READ_QUEUE: "MESSAGE_READ_QUEUE",
  MESSAGE_READ_QUEUE_GROUP: "MESSAGE_READ_QUEUE_GROUP",
  dbCollections: {
    MESSAGES: "message",
    WALLETS: "wallet",
    CONVERSATIONS: "conversation",
    COIN_TRANSACTIONS: "coinTransaction",
    TOKEN: "coinTransaction",
  },
  MASTER_DB: process.env.MONGO_DB_NAME,
};
