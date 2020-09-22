const router = require("express").Router();
const {
  validateAccessToken,
  checkAccessToken,
  checkUserAccess,
} = require("../middlewares/auth");
const { internalServerError } = require("../utils/response");
const {
  newFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
} = require("../controllers/follow_request");

router.post(
  "/",
  checkAccessToken,
  validateAccessToken,
  checkUserAccess,
  async (req, res) => {
    try {
      await newFollowRequest(req, res);
    } catch (error) {
      internalServerError(res, error);
    }
  }
);

router.patch(
  "/accept",
  checkAccessToken,
  validateAccessToken,
  checkUserAccess,
  async (req, res) => {
    try {
      await acceptFollowRequest(req, res);
    } catch (error) {
      internalServerError(res, error);
    }
  }
);

router.patch(
  "/reject",
  checkAccessToken,
  validateAccessToken,
  checkUserAccess,
  async (req, res) => {
    try {
      await rejectFollowRequest(req, res);
    } catch (error) {
      internalServerError(res, error);
    }
  }
);

module.exports = router;
