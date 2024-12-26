const express = require("express");
const auth = require("../middleware/auth.middleware");
const contractController = require("./contract.controller");
const router = express.Router();

router.post("/createContract", contractController.createContract);
router.get(
  "/getContractsByUser",
  auth(["Customer", "Member", "SuperAdmin"]),
  contractController.getContractsByUser
);
router.get(
  "/getContractById/:id",
  auth(["Customer", "Member", "SuperAdmin"]),
  contractController.getContractById
);

module.exports = router;
