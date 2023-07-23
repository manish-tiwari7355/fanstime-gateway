const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const crypto = require("crypto");

const { accessSecret, refreshSecret } = require("../config/keys").jwt;

const generateAccessToken = (payload, expiresIn) => {
  const token = jwt.sign(payload, accessSecret, { expiresIn });
  if (!token) return createError.InternalServerError();
  return token;
};

const generateRefreshToken = (payload, expiresIn) => {
  const token = jwt.sign(payload, refreshSecret, { expiresIn });
  if (!token) return createError.InternalServerError();
  return token;
};

const generateCryptoKey = () => crypto.randomBytes(32).toString("hex");

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateCryptoKey,
};
