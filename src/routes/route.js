const express = require('express');
const router = express()

const UserController = require("../controllers/usercontroller");

router.post("/register" , UserController.createUser)

module.exports.router;