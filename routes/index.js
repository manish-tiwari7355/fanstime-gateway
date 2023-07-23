const router = require("express").Router();
const querystring = require("node:querystring");
const { createProxyMiddleware } = require("http-proxy-middleware");
const validateAccessToken = require("../middlewares/jwt_validation");

const { resolve } = require("srv-discovery");
const { escape, unescape } = require("lodash");

const serviceMap = require("../config/keys").serviceMap;

const getRouter = async (req) => {
  let serviceName = getServiceName(req);
  console.info(`Service name in getRouterFunction is  ${serviceName}`);
  let routerUrl = serviceMap[serviceName];
  // let routerUrl = await resolve(serviceMap[serviceName]);
  if (routerUrl) routerUrl = `http://${routerUrl}`;
  if (!routerUrl.endsWith("/")) routerUrl = routerUrl + "/";
  console.info(`Final router URL from getRouter is ${routerUrl}`);
  return routerUrl;
};

/**
 * All requests which needs to be proxied should start with /gateway followed by the downstream service name.
 * So both those values should be taken out from the actual url.
 * @param {*} path
 * @param {*} req
 */
const getPathRewrite = async (path, req) => {
  let pathToRewrite = "/gateway";
  if (getServiceName(req) && getServiceName(req) != "") {
    pathToRewrite = pathToRewrite + "/" + getServiceName(req);
  }
  let newPath = path.replace(pathToRewrite, "");

  return newPath;
};

/**
 * Expect URL to be in the format /gateway/service/<<rest of the downstream api url path>>
 * We need to match the service by taking the second part of the request path.
 *
 * @param {*} req
 */
const getServiceName = (req) => {
  let serviceName = "";
  if (req.path.split("/").length >= 3) {
    serviceName = req.path.split("/")[2];
  }
  return serviceName;
};

/**
 * Any additions modifications to the proxied request can be done here
 *
 */
const onProxyReq = async (proxyReq, req) => {
  // Following block is required since we are using body parser. If we remove body parser from gateway middleware or
  // add the proxy router before body parser below block is not required. This block is required to wrap the request back in a
  // format that nodejs can understand. (No harm in keeping it since we simply return out of this if req.body is already there)

  // check if req.user is json object

  try {
    const user = JSON.stringify(req.user);

    proxyReq.setHeader("x-user-data", unescape(encodeURIComponent(user)));
  } catch (error) {
    console.log(
      "Error in setting user data in header",
      req.user,
      typeof req.user,
      error
    );
    console.log("Error in setting user data in header", error);
    proxyReq.setHeader("x-user-data", "{}");
  }

  const requestBody = req.body;
  if (!requestBody || !Object.keys(requestBody).length) {
    return;
  }
  const contentType = proxyReq.getHeader("Content-Type");
  const writeBody = (bodyData) => {
    // deepcode ignore ContentLengthInCode: bodyParser fix
    proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  };
  if (contentType && contentType.includes("application/json")) {
    writeBody(JSON.stringify(requestBody));
  }
  if (contentType === "application/x-www-form-urlencoded") {
    writeBody(querystring.stringify(requestBody));
  }
};

const onError = async (err, req, res) => {
  console.log(`Error is ${JSON.stringify(err)}`);
  res.writeHead(500, { "Content-Type": "application/json" });
  res.end(`Unable to get response due to ${err}`);
};

/**
 * Configure Proxy Middleware
 */
const proxyMiddlewareOptions = {
  target: "http://localhost:8080",
  router: getRouter,
  changeOrigin: true,
  secure: false,
  pathRewrite: getPathRewrite,
  proxyTimeout: 600000,
  onProxyReq: onProxyReq,
  onError: onError,
};

router.use(
  "/gateway",
  validateAccessToken,
  createProxyMiddleware(proxyMiddlewareOptions)
);
router.get("/ping", (req, res) =>
  res.send({ status: 200, message: "Success" })
);

module.exports = router;
