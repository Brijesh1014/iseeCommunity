const express = require("express");
const auth = require("../middleware/auth.middleware");
const orderController = require("./order.controller");
const router = express.Router();

router.post(
  "/createOrder",
  auth(["Customer", "Member", "SuperAdmin"]),
  orderController.createOrder
);
router.get(
  "/getOrdersByUser",
  auth(["Customer", "Member", "SuperAdmin"]),
  orderController.getOrdersByUser
);


module.exports = router;
