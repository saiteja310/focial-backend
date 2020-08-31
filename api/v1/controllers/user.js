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
    username: userData.firstName + "_" + crypto.randomBytes(2).toString("hex"),
    firstName: userData.firstName,
    lastName: userData.lastName,
    photoUrl: userData.photoUrl,
  });
  await user.save();
};

module.exports.getUser = async (req, res) => {
  await User.findOne(
    { email: req.tokenData.email },
    { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
  )
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
        user: document,
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
    { email: req.tokenData.email },
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

module.exports.deleteUser = async (email) => {
  await User.deleteOne({ email: email });
};

module.exports.uploadProfilePicture = async (req, res) => {
  await User.updateOne(
    { email: req.tokenData.email },
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
    { email: req.tokenData.email },
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

async function fetchNameOfUser(email) {
  await User.findOne({ email: email }, { firstName: 1, lastName: 1 })
    .then((document) => {
      if (!document) {
        return " ";
      }
      return document.firstName + " " + document.lastName;
    })
    .catch((err) => {
      console.log(err);
      return " ";
    });
}
