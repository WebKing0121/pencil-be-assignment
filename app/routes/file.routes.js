const { authJwt } = require("../middlewares");
const Path = require("path");
const controller = require("../controllers/file.controller");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + Path.extname(file.originalname)
    );
  },
});

module.exports = function (app) {
  const upload = multer({
    storage: storage,
  });

  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/upload",
    [authJwt.verifyToken],
    upload.single("file"),
    controller.upload
  );

  app.get("/download", controller.download);
};
