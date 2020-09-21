const mongoose = require("mongoose");
const { COMMENT_COLLECTION } = require("../utils/constants").collections;

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(COMMENT_COLLECTION, commentSchema);
