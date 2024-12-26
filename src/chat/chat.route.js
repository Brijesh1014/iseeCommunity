const express = require("express");
const chatController = require("./chat.controller");
const auth = require("../middleware/auth.middleware");
const router = express.Router();

router.get(
  "/getMessagesByReceiverId/:receiverId",
  chatController.getMessagesByReceiverId
);
router.delete(
  "/deleteMessage/:id",
  auth(["Customer", "Member", "SuperAdmin"]),
  chatController.deleteMessage
);
router.delete(
  "/deletePreviousChat/:userId1/:userId2",
  auth(["Customer", "Member", "SuperAdmin"]),
  chatController.deletePreviousChat
);
router.put(
  "/softDeletedPreviousChat/:userId1/:userId2",
  auth(["Customer", "Member", "SuperAdmin"]),
  chatController.softDeletedPreviousChat
);
router.put("/softDeleteChat/:id", chatController.softDeleteChat);

module.exports = router;
