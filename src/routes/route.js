const express = require('express');
const router = express.Router();

const UserController = require("../controllers/usercontroller");

router.post("/register" , UserController.createUser)
router.post("/login" , UserController.userLogin)

module.exports=router;