const mongoose = require("mongoose");
const { NOTIFICATION_COLLECTION } = require("../utils/constants").collections;

const schema = new mongoose.Schema(
  {
    /*
     * 0 - new follow request
     * 1 - follow request accepted
     * 2 - comment on post
     * 3 - like on post
     */
    type: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    // notification is meant for this user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // if notification is raised by community then it can be blank
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    // if it belongs to type 2, 3
    postId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    // if it belongs to type 0,1
    // nothing required for now

    // notification message
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(NOTIFICATION_COLLECTION, schema);
