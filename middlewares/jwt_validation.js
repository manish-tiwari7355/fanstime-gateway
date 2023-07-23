const jwt = require("jsonwebtoken");
const createError = require("http-errors");

const {
  jwt: { accessSecret, refreshSecret, accessTokenLife, refreshTokenLife },
  redis: { accessTokenTTL },
} = require("../config/keys");

const { mongoClient } = require("../utils/Mongo.util");
const redisClient = require("../utils/Redis.util");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../services/generate_token");
const constants = require("../config/constants");

const masterDB = mongoClient.db(constants.MASTER_DB);

const validateAccessToken = async (req, res, next) => {
  if (
    req.path.includes("/auth") ||
    req.path.includes("/stripe/hooks") ||
    req.path.includes("/public")
  )
    return next();
  // if (!req.cookies?.auth)
  //   return next(createError.Unauthorized("Please login first"));

  let bearerToken = req.headers["authorization"];

  if (req.cookies?.auth) bearerToken = req.cookies?.auth;

  if (!bearerToken) return next(createError.Unauthorized("Please login first"));
  const token =
    bearerToken?.split(" ")[0] === "Bearer"
      ? bearerToken?.split(" ")[1]
      : bearerToken;
  let userDetails = await redisClient.get(token);
  if (!userDetails) {
    jwt.verify(token, accessSecret, async (err, decoded) => {
      if (err) {
        if (err.message === "jwt expired") {
          if (req.cookies?.auth) {
            const { refresh: refreshtoken } = req.cookies;

            try {
              const payload = jwt.verify(refreshtoken, refreshSecret);
              if (!payload)
                throw createError.Unauthorized(
                  "Session expired. Please login again."
                );

              const resultQuery = await masterDB
                .collection(constants.dbCollections.TOKEN)
                .findOne({
                  // _userId: payload.data._id,
                  token: refreshtoken,
                });
              if (!resultQuery)
                return next(
                  createError.Unauthorized("Token expired! Please login again")
                );

              const jwtPayload = {
                data: payload.data,
                type: payload.type,
              };

              const accessToken = generateAccessToken(
                jwtPayload,
                accessTokenLife
              );
              const refreshToken = generateRefreshToken(
                jwtPayload,
                refreshTokenLife
              );
              if (accessToken && refreshToken) {
                await redisClient.set(accessToken, JSON.stringify(payload), {
                  EX: accessTokenTTL,
                });
                await masterDB
                  .collection(constants.dbCollections.TOKEN)
                  .updateOne(
                    { _id: resultQuery._id },
                    { token: refreshToken },
                    { upsert: true }
                  );
                res.cookie("auth", accessToken, {
                  httpOnly: process.env.NODE_ENV === "development",
                  secure: process.env.NODE_ENV !== "development",
                  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
                });
                res.cookie("refresh", refreshToken, {
                  httpOnly: process.env.NODE_ENV === "development",
                  secure: process.env.NODE_ENV !== "development",
                  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
                });
                const json_ = res.json; // capture the default resp.json implementation

                res.json = function (object) {
                  json_.call(res, object);
                };
                req.user = { data: payload.data };
                return next();
              }
            } catch (error) {
              // delete cookies
              res.clearCookie("auth");
              res.clearCookie("refresh");

              if (error.message === "jwt expired")
                return next(createError.Unauthorized("Please login again"));
              return next(createError.InternalServerError());
            }
          }
          return next(createError.Unauthorized("Please login again"));
        } else {
          const message =
            err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
          return next(createError.Unauthorized(message));
        }
      }
      userDetails = decoded;
    });
  } else {
    userDetails = JSON.parse(userDetails);
  }
  req.user = userDetails;
  next();
};

module.exports = validateAccessToken;
