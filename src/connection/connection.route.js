const express = require("express");
const auth = require("../middleware/auth.middleware");
const connectionController = require("./connection.controller");
const router = express.Router();

router.post(
  "/createConnectionRequest",
  auth(["Customer", "Member", "SuperAdmin"]),
  connectionController.createConnectionRequest
);
router.get(
  "/getAllConnectionRequests",
  auth(["Customer", "Member", "SuperAdmin"]),
  connectionController.getAllConnectionRequests
);

router.get(
    "/getConnectedUsers",
    auth(["Customer", "Member", "SuperAdmin"]),
    connectionController.getConnectedUsers
  );
router.put(
  "/updateConnectionStatus/:id",
  auth(["SuperAdmin"]),
  connectionController.updateConnectionStatus
);

module.exports = router;
