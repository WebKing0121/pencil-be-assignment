const { authJwt } = require("../middlewares");
const controller = require("../controllers/url.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/parse", [authJwt.verifyToken], controller.parseUrl);
};
