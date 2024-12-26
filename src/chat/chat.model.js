const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isSeen: {
    type: Boolean,
    default: false,
  },

  softDelete: [
    {
      isDeleted: Boolean,
      userId: mongoose.Schema.Types.ObjectId,
    },
  ],
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
