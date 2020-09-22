const mongoose = require("mongoose");
const { FOLLOW_REQUEST_COLLECTION } = require("../utils/constants").collections;
const followRequest = require("../utils/constants").followRequest;

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: followRequest.PENDING,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(FOLLOW_REQUEST_COLLECTION, commentSchema);
