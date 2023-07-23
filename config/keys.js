require("dotenv").config();

module.exports = {
  host: {
    port: process.env.PORT
  },
  serviceMap: {
    server: process.env.BACKEND_SERVER_URL,
    messaging: process.env.MESSAGING_SERVER_URL,
    webSocket: process.env.WEBSOCKET_SERVER_URL,
    util: process.env.UTIL_SERVER_URL,
    feed: process.env.FEED_SERVER_URL,
  },
  app: {
    name: "myFanstime Gateway",
    serverURL: process.env.BASE_SERVER_URL,
    apiURL: process.env.BASE_API_URL,
    clientURL: process.env.BASE_CLIENT_URL,
  },
  redis: {
    accessTokenTTL: 60 * 60 * 24,
  },
  aws: {
    bucketName: process.env.AWS_BUCKET_NAME,
    fileURL: `https://s3-${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}`,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    sesSenderAddress: "suryapratap.babbar@simbaquartz.com",
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret:  process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  database: process.env.DB_CONNECT,
  jwt: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenLife: process.env.ACCESS_TOKEN_LIFE,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenLife: process.env.REFRESH_TOKEN_LIFE,
  },
  nodemailer: {
    sender: process.env.NODEMAILER_EMAIL_SENDER,
    pass: process.env.NODEMAILER_EMAIL_PASS,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
  },
};
