const router = require("express").Router();
const {
  validateAccessToken,
  checkAccessToken,
  checkUserAccess,
} = require("../middlewares/auth");
const { internalServerError } = require("../utils/response");
const { newPost, getMyPosts, uploadPostImage } = require("../controllers/post");
const path = require("path");
const multer = require("multer");
const ppStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../../public/uploads/posts/"));
  },
  filename: function (req, file, cb) {
    cb(null, _getFileName(file));
  },
});
const ppUpload = multer({ storage: ppStorage });

function _getFileName(file) {
  const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
  return (
    uniqueSuffix +
    "_" +
    file.originalname.toString().substr(file.originalname.length - 8)
  );
}

router.post(
  "/",
  checkAccessToken,
  validateAccessToken,
  checkUserAccess,
  async (req, res) => {
    try {
      await newPost(req, res);
    } catch (error) {
      internalServerError(res, error);
    }
  }
);

router.get(
  "/",
  checkAccessToken,
  validateAccessToken,
  checkUserAccess,
  async (req, res) => {
    try {
      await getMyPosts(req, res);
    } catch (error) {
      internalServerError(res, error);
    }
  }
);

router.post(
  "/image",
  checkAccessToken,
  validateAccessToken,
  checkUserAccess,
  ppUpload.single("file"),
  async (req, res) => {
    try {
      await uploadPostImage(req, res);
    } catch (error) {
      internalServerError(res, error);
    }
  }
);

module.exports = router;
