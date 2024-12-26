const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
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
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    paymentDetails: {
      transactionId: { type: String },
      paymentMethod: { type: String }, // e.g., "Credit Card", "UPI", etc.
    },
    status: {
      type: String,
      enum: ["Active", "Cancelled"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
