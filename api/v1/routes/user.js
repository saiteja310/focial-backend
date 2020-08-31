const router = require("express").Router();
const path = require("path");
const { internalServerError } = require("../utils/response");
const {
  validateAccessToken,
  checkAccessToken,
  checkUserAccess,
  checkUsername,
} = require("../middlewares/auth");
const {
  getUser,
  updateUser,
  uploadProfilePicture,
  uploadCoverPicture,
  checkUsernameAvailability,
} = require("../controllers/user");
const multer = require("multer");
const ppStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../../public/uploads/pps/"));
  },
  filename: function (req, file, cb) {
    cb(null, _getFileName(file));
  },
});
const ppUpload = multer({ storage: ppStorage });

const coverStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../../public/uploads/cover/"));
  },
  filename: function (req, file, cb) {
    cb(null, _getFileName(file));
  },
});
const coverUpload = multer({ storage: coverStorage });

function _getFileName(file) {
  const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
  return (
    uniqueSuffix +
    "_" +
    file.originalname.toString().substr(file.originalname.length - 8)
  );
}

router.get(
  "/",
  checkAccessToken,
  validateAccessToken,
  checkUserAccess,
  async (req, res) => {
    try {
      await getUser(req, res);
    } catch (error) {
      internalServerError(res, error);
    }
  }
);

router.patch(
  "/",
  checkAccessToken,
  validateAccessToken,
  checkUserAccess,
  async (req, res) => {
    try {
      await updateUser(req, res);
    } catch (error) {
      internalServerError(res, error);
    }
  }
);

router.post(
  "/pp",
  checkAccessToken,
  validateAccessToken,
  checkUserAccess,
  ppUpload.single("file"),
  async (req, res) => {
    try {
      await uploadProfilePicture(req, res);
    } catch (error) {
      internalServerError(res, error);
    }
  }
);

router.post(
  "/cover",
  checkAccessToken,
  validateAccessToken,
  checkUserAccess,
  coverUpload.single("file"),
  async (req, res) => {
    try {
      await uploadCoverPicture(req, res);
    } catch (error) {
      internalServerError(res, error);
    }
  }
);

router.get(
  "/check/:username",
  checkAccessToken,
  validateAccessToken,
  checkUserAccess,
  checkUsername,
  async (req, res) => {
    try {
      await checkUsernameAvailability(req, res);
    } catch (error) {
      internalServerError(res, error);
    }
  }
);

module.exports = router;
