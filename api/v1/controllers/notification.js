const Notification = require("../models/notification");
const mongoose = require("mongoose");
const { SUCCESS } = require("../utils/constants").successMessages;

module.exports.getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({
    userId: mongoose.Types.ObjectId(req.tokenData.authId),
  })
    .sort({ createdAt: -1 })
    .limit(20);

  return res.status(200).json({
    status: SUCCESS,
    message: "Fetched notifications",
    notifications: notifications,
  });
};

module.exports.addFollowRequest = async (whoFollowed, whom) => {
  const newNotify = new Notification({
    type: 0,
    userId: whom,
    authorId: whoFollowed,
    text: "has requested to follow you",
  });

  await newNotify.save((err, saved) => {
    if (err) return false;
    return saved;
  });
};

module.exports.addFollowRequestAccepted = async (
  whoAccepted,
  whoseFollowRequest
) => {
  const newNotify = new Notification({
    type: 1,
    userId: whoseFollowRequest,
    authorId: whoAccepted,
    text: "has accepted your follow request",
  });

  await newNotify.save((err, saved) => {
    if (err) return false;
    return saved;
  });
};

module.exports.addCommentOnPost = async (whoCommented, onWhosePost, postId) => {
  const newNotify = new Notification({
    type: 2,
    userId: whoCommented,
    authorId: onWhosePost,
    postId: postId,
    text: "has commented on your post",
  });

  await newNotify.save((err, saved) => {
    if (err) return false;
    return saved;
  });
};

module.exports.addLikeOnPost = async (whoLiked, onWhosePost, postId) => {
  const newNotify = new Notification({
    type: 3,
    userId: whoLiked,
    authorId: onWhosePost,
    postId: postId,
    text: "has liked your post",
  });

  await newNotify.save((err, saved) => {
    if (err) return false;
    return saved;
  });
};
