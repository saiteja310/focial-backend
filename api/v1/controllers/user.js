const User = require("../models/user");
const {
  FAILED,
  USER_NOT_EXISTS,
  USER_DATA_UPDATE_FAILED,
  USERNAME_TAKEN,
} = require("../utils/constants").errors;
const {
  SUCCESS,
  FETCHED_USER_DATA,
  UPDATED_USER_DATA,
  USERNAME_AVAILABLE,
} = require("../utils/constants").successMessages;
const crypto = require("crypto");

module.exports.createUser = async (userData) => {
  var user = new User({
    userId: userData._id,
    email: userData.email,
    username:
      userData.firstName.toString().toLowerCase() +
      "_" +
      crypto.randomBytes(2).toString("hex"),
    firstName: userData.firstName,
    lastName: userData.lastName,
    photoUrl: userData.photoUrl,
  });
  await user.save();
};
const mongoose = require("mongoose");

module.exports.getUser = async (req, res) => {
  console.log(req.tokenData.authId);

  await User.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(req.tokenData.authId.toString()),
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "userId",
        foreignField: "userId",
        as: "posts",
      },
    },
    {
      $addFields: {
        posts: { $size: "$posts" },
      },
    },
    {
      $project: {
        posts: 1,
        _id: 0,
        userId: 1,
        email: 1,
        username: 1,
        firstName: 1,
        lastName: 1,
        gender: 1,
        age: 1,
        bio: 1,
        phone: 1,
        photoUrl: 1,
        coverPic: 1,
        following: {
          $cond: {
            if: { $isArray: "$following" },
            then: { $size: "$following" },
            else: 0,
          },
        },
        followers: {
          $cond: {
            if: { $isArray: "$followers" },
            then: { $size: "$followers" },
            else: 0,
          },
        },
      },
    },
  ])
    .then((document) => {
      if (!document) {
        return res.status(403).json({
          status: FAILED,
          message: USER_NOT_EXISTS,
        });
      }
      return res.status(200).json({
        status: SUCCESS,
        message: FETCHED_USER_DATA,
        user: document[0],
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(403).json({
        status: FAILED,
        message: USER_NOT_EXISTS,
      });
    });
};

module.exports.updateUser = async (req, res) => {
  var user = await User.findOne(
    { userId: req.tokenData.authId },
    { createdAt: 0, updatedAt: 0, __v: 0 }
  );
  user = _updateUserModel(user, req.body);
  await user.save((error, updated) => {
    if (error)
      return res.status(403).json({
        status: FAILED,
        message: USER_DATA_UPDATE_FAILED,
      });
    return res.status(200).json({
      status: SUCCESS,
      message: UPDATED_USER_DATA,
      user: updated,
    });
  });
};

module.exports.deleteUser = async (authId) => {
  await User.deleteOne({ userId: authId });
};

module.exports.uploadProfilePicture = async (req, res) => {
  await User.updateOne(
    { userId: req.tokenData.authId },
    { $set: { photoUrl: "uploads/pps/" + req.file.filename } }
  )
    .then((saved) => {
      console.log(saved);
      return res.status(200).json({
        status: SUCCESS,
        message: "Profile picture uploaded",
        photoUrl: "uploads/pps/" + req.file.filename,
      });
    })
    .catch((err) => {
      return res.status(200).json({
        status: FAILED,
        message: "Profile picture upload failed",
        error: err,
      });
    });
};

module.exports.uploadCoverPicture = async (req, res) => {
  await User.updateOne(
    { userId: req.tokenData.authId },
    { $set: { coverPic: "uploads/cover/" + req.file.filename } }
  )
    .then((saved) => {
      console.log(saved);
      return res.status(200).json({
        status: SUCCESS,
        message: "Cover picture uploaded",
        photoUrl: "uploads/cover/" + req.file.filename,
      });
    })
    .catch((err) => {
      return res.status(200).json({
        status: FAILED,
        message: "Cover picture upload failed",
        error: err,
      });
    });
};

module.exports.checkUsernameAvailability = async (req, res) => {
  const user = await User.findOne(
    { username: req.params.username },
    { _id: 1 }
  );
  if (user) {
    return res.status(409).json({
      status: FAILED,
      message: USERNAME_TAKEN,
    });
  } else {
    return res.status(200).json({
      status: SUCCESS,
      message: USERNAME_AVAILABLE,
    });
  }
};

function _updateUserModel(userData, updated) {
  for (const [key, value] of Object.entries(updated)) {
    if (value && _isAllowed(key)) {
      userData[key] = updated[key];
    }
  }

  return userData;
}

const _immutableFields = [
  "email",
  "userId",
  "_id",
  "__v",
  "createdAt",
  "updatedAt",
];

function _isAllowed(key) {
  return !_immutableFields.includes(key);
}

module.exports.fetchNameOfUser = async function (authId) {
  var username = " ";
  await User.findOne(
    { userId: authId },
    { firstName: 1, lastName: 1 },
    (error, document) => {
      if (error) {
        console.log(error);
      } else {
        username = document.firstName + " " + document.lastName;
      }
    }
  );
  return username;
};

module.exports.getFollowingList = async (authId) => {
  return await User.findOne({ userId: authId }, { following: 1, userId: 1 });
};
