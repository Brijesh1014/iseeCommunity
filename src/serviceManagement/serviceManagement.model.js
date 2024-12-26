const mongoose = require("mongoose");

const serviceManagementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Executive Service", "Operation", "Trade"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    image: {
      type: String,
    },
    price: {
      type: Number,
      default:0
    },
    status: {
      type: String,
      enum: ["Activate", "Deactivate"],
      default: "Activate",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceManagementSchema);
