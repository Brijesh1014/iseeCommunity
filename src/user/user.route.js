const express = require("express");
const userController = require("./user.controller");
const auth = require("../middleware/auth.middleware");
const router = express.Router();


router.get("/getUserById/:id",   auth(["Customer","SuperAdmin"]), userController.getById);

router.put("/updateUser/:id",   auth(["Customer","SuperAdmin"]), userController.updateById)

router.get("/getAllMembers",   auth(["Customer","SuperAdmin"]), userController.getAllMembers);



module.exports = router;
