const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    contactNumber: { type: String },
    description: { type: String },
    serviceId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quote", quoteSchema);
