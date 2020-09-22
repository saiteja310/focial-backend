const router = require("express").Router();
const {
  checkAccessToken,
  validateAccessToken,
  checkUserAccess,
} = require("../middlewares/auth");
const { internalServerError } = require("../utils/response");
const { getMyNotifications } = require("../controllers/notification");

router.get(
  "/",
  checkAccessToken,
  validateAccessToken,
  checkUserAccess,
  async (req, res) => {
    try {
      await getMyNotifications(req, res);
    } catch (error) {
      internalServerError(res, error);
    }
  }
);

module.exports = router;
