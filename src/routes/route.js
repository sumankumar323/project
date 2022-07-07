const express = require('express');
const router = express.Router();

const userController = require("../controllers/usercontroller")
const bookController = require("../controllers/bookcontroller")
const reviewController = require("../controllers/reviewcontrollers")
const middleware = require("../middleware/middlware")

//User & Login API
router.post("/register", userController.createUser);
router.post("/login", userController.userLogin);

//Book API
router.post("/books", middleware.mid1, bookController.createBook)
router.get("/books", middleware.mid1, bookController.getBooks)
router.get("/books/:bookId", middleware.mid1, bookController.getReviewDetails)
router.put("/books/:bookId", middleware.mid1, bookController.updatebook)
router.delete("/books/:bookId", middleware.mid1, bookController.deleteBook)

//Review API
router.post("/books/:bookId/review", reviewController.createReview)
router.put("/books/:bookId/review/:reviewId", reviewController.updateReview)
router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview)


module.exports = router