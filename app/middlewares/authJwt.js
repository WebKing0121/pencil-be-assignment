const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");

verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];
  const bearerHeaderKey = "Bearer";
  const parts = token.split(" ");
  if (parts.length === 2 && parts[0] === bearerHeaderKey) {
    if (token) {
      error = true;
    }
    token = parts[1];
  }

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};

const authJwt = {
  verifyToken,
};
module.exports = authJwt;
