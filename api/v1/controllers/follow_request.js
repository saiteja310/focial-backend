const FollowRequst = require("../models/follow_request");
const { SUCCESS } = require("../utils/constants").successMessages;
const { FAILED } = require("../utils/constants").errors;
const followRequest = require("../utils/constants").followRequest;
const {
  addToFollowersList,
  addToFollowingList,
} = require("../controllers/user");

module.exports.newFollowRequest = async (req, res) => {
  const fr = new FollowRequst({
    userId: req.body.userId,
    requestedBy: req.tokenData.authId,
  });

  await fr.save((err, saved) => {
    if (err) {
      return res.status(403).json({
        status: FAILED,
        message: "Unable to send follow request, try again",
      });
    }
    return res.status(201).json({
      status: SUCCESS,
      message: "Follow request sent",
      requestId: saved._id,
    });
  });
};

module.exports.acceptFollowRequest = async (req, res) => {
  const request = await FollowRequst.findById(req.body.requestId);
  if (!request)
    return res.status(403).json({
      status: FAILED,
      message: "Invalid requestId, request doesn't exists",
    });

  if (!request.userId.toString().includes(req.tokenData.authId.toString())) {
    return res.status(400).json({
      status: FAILED,
      message: "You are not allowed to do this operation",
    });
  }

  request.status = followRequest.ACCEPTED;

  // add them to followers list on both ends
  // the requesting user should be added to the followers list of targetUser
  // the target user should be added to the following list of requested user
  const followUser = await addToFollowingList(
    request.requestedBy,
    request.userId
  );

  const makeHimFan = await addToFollowersList(
    request.userId,
    request.requestedBy
  );

  if (!followUser || !makeHimFan)
    return res.status(403).json({
      status: FAILED,
      message: "Failed to accept follow request, please try later",
    });

  await request.save((err, saved) => {
    if (err)
      return res.status(403).json({
        status: FAILED,
        message: "Failed to accept the request",
      });

    console.log(saved);
    return res.status(200).json({
      status: SUCCESS,
      message: "Approved follow request",
    });
  });
};

module.exports.rejectFollowRequest = async (req, res) => {
  await FollowRequst.updateOne(
    {
      _id: req.body.requestId,
    },
    {
      $set: {
        status: followRequest.REJECTED,
      },
    },
    (err, saved) => {
      if (err) {
        console.log(err);
        return res.status(403).json({
          status: FAILED,
          message: "Failed to reject the request",
        });
      }

      console.log(saved);
      return res.status(200).json({
        status: SUCCESS,
        message: "Rejected follow request",
      });
    }
  );
};
