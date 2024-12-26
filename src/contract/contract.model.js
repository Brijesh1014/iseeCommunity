const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    contractNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    services: [
      {
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    contractDescription: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in months
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Expired", "Cancelled"],
      default: "Active",
    },
    contractDate: {
      type: Date,
      default: Date.now,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contract", contractSchema);
