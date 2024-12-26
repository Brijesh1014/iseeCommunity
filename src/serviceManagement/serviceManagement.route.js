const express = require("express");
const auth = require("../middleware/auth.middleware");
const serviceController = require("./serviceManagement.controller");
const router = express.Router();

router.get(
  "/getAllServices",
  auth(["Customer", "Member", "SuperAdmin"]),
  serviceController.getAllServices
);
router.get(
  "/getServiceById/:id",
  auth(["Customer", "Member", "SuperAdmin"]),
  serviceController.getServiceById
);
router.post(
  "/createService/",
  auth(["SuperAdmin"]),
  serviceController.createService
);
router.put(
  "/updateService/:id",
  auth(["SuperAdmin"]),
  serviceController.updateService
);
router.delete(
  "/deleteService/:id",
  auth(["SuperAdmin"]),
  serviceController.deleteService
);

module.exports = router;
