const bookModel = require("../Model/bookmodel");
const reviewModel = require("../Model/reviewmodel");
const {
  isValidReqBody,
  isValid,
  isValidObjectId,
  isValidRating,
  isValidName,
  isValidRelAt,
} = require("../validator/validator");

exports.updateReview = async function (req, res) {
  try {
    const bookId = req.params.bookId;
    const reviewId = req.params.reviewId;

    //ojectId validation
    if (!isValidObjectId(bookId)) {
      return res
        .status(400)
        .send({ status: false, msg: "bookId is not valid!" });
    }

    //objectId validation
    if (!isValidObjectId(reviewId)) {
      return res
        .status(400)
        .send({ status: false, msg: "reviewId is not valid!" });
    }

    //Finding book by bookId
    const availableBook = await bookModel.findOne({
      _id: bookId,
      isDeleted: false,
    });
    if (!availableBook) {
      return res.status(404).send({ status: false, msg: "Book Not Found!" });
    }

    //finding review by reviewid
    const availableReview = await reviewModel.findOne({
      _id: reviewId,
      isDeleted: false,
    });
    if (!availableReview) {
      return res.status(404).send({ status: false, msg: "Review Not Found!" });
    }

    //checkingis review's bookId is same as of given bookId
    if (availableReview.bookId != bookId) {
      return res
        .status(403)
        .send({ status: false, message: "review is not from this book!" });
    }
    //taking data in request body for updation
    const bodyFromReq = req.body;

    if (!isValidReqBody(bodyFromReq)) {
      return res.status(400).send({
        status: false,
        msg: "Please provide review details to update!",
      });
    }

    const { reviewedBy, review, rating } = bodyFromReq;

    //hasOwnProperty will check if request body has that property or not
    if (bodyFromReq.hasOwnProperty("reviewedBy")) {
      if (!isValid(reviewedBy)) {
        return res
          .status(400)
          .send({ status: false, msg: "reviewedBy is not valid!" });
      }
      if (!isValidName(reviewedBy)) {
        return res
          .status(400)
          .send({ status: false, msg: "plesae give a valid reviewedBy name" });
      }
    }

    if (bodyFromReq.hasOwnProperty("review")) {
      if (!isValid(review)) {
        return res
          .status(400)
          .send({ status: false, msg: "review is not valid!" });
      }
    }

    if (bodyFromReq.hasOwnProperty("rating")) {
      if (!isValidRating(rating)) {
        return res
          .status(400)
          .send({ status: false, msg: "rating is not valid!" });
      }
    }

    //updating review
    const updatedReview = await reviewModel.findOneAndUpdate(
      { _id: reviewId },
      { ...bodyFromReq },
      { new: true }
    );

    const allAvailableReviews = await reviewModel.find({
      bookId: bookId,
      isDeleted: false,
    });

    //setting a new key in review object
    let availableBook1 = availableBook.toObject();
    availableBook1.reviewData = allAvailableReviews;

    return res.status(200).send({ status: true, data: availableBook1 });
  } catch (err) {
    return res.status(500).send({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

//-------********_____.........Add Review -----------***************.....................

exports.addReview = async function (req, res) {
  try {
    const bookId = req.params.bookId;
    const queryParams = req.body;
    const { reviewedBy, reviewedAt, rating, review } = queryParams;

    if (!isValidReqBody(queryParams)) {
      return res.status(400).send({
        status: false,
        message: "Please provide the book review details",
      });
    }
    if (!isValidObjectId(bookId)) {
      return res
        .status(400)
        .send({ status: false, message: "Book id is not valid!" });
    }
    if (!isValid(reviewedBy)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide reviewer name!" });
    }
    if (!isValidName(reviewedBy)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Please provide correct reviewer name!",
        });
    }
    if (!isValid(rating)) {
      return res
        .status(400)
        .send({ status: false, message: "Rating scale plss provide" });
    }

    if (!isValidRating(rating)) {
      return res
        .status(400)
        .send({ status: false, message: "Rating scale should be 1 - 5!" });
    }

    if (!isValid(reviewedAt)) {
      return res
        .status(400)
        .send({ status: false, message: "plss provide reviewedAt" });
    }
    if (!isValidRelAt(reviewedAt)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "wrong fromat reviewedAt format is yyyy-mm-dd",
        });
    }

    if (!isValid(review)) {
      return res
        .status(400)
        .send({ status: false, message: "plss provide any comment" });
    }
    if (!isValidName(review)) {
      return res
        .status(400)
        .send({ status: false, message: "plss enter valid comment" });
    }

    const book = await bookModel.findById(bookId);

    if (!book) {
      return res.status(404).send({ status: false, message: "No book found" });
    }

    const data = { bookId: bookId, ...queryParams };

    const reviewData = await reviewModel.create(data);

    const reviewResponse = {
      _id: reviewData._id,
      bookId: reviewData.bookId,
      reviewedBy: reviewData.reviewedBy,
      reviewedAt: reviewData.reviewedAt,
      rating: reviewData.rating,
      review: reviewData.review,
    };
    await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: 1 } });

    return res
      .status(201)
      .send({ status: true, message: "Success", data: reviewResponse });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//........................**********------------ DELETE books by reviewsId------*******............

exports.deleteReview = async function (req, res) {
  try {
    const bookIdParams = req.params.bookId;
    const reviewIdParams = req.params.reviewId;

    // Validation of ID
    if (!isValidObjectId(bookIdParams))
      return res.status(400).send({
        status: false,
        message: `${bookIdParams} is not a valid book id`,
      });

    if (!isValidObjectId(reviewIdParams))
      return res.status(400).send({
        status: false,
        message: `${reviewIdParams} is not a valid review id`,
      });

    // Finding not deleted book by id in url
    const findBook = await bookModel.findOne({
      _id: bookIdParams,
      isDeleted: false,
    });
    if (!findBook)
      return res.status(404).send({ status: false, message: `Book not Found` });

    // Finding not deleted review by id in url
    const findReview = await reviewModel.findOne({
      _id: reviewIdParams,
      isDeleted: false,
    });
    if (!findReview)
      return res
        .status(404)
        .send({ status: false, message: `Review not found` });

    // verifying review id belongs to the book or not
    const bookIdFromReview = findReview.bookId.toString();
    if (bookIdParams !== bookIdFromReview)
      return res.status(400).send({
        status: false,
        messege:
          "The review you want to delete not belongs to the book provide in url.",
      });

    // Deleting the review
    await reviewModel.findOneAndUpdate(
      { _id: reviewIdParams },
      { isDeleted: true }
    );

    // Decrease Review count of the book
    await bookModel.findOneAndUpdate(
      { _id: bookIdParams },
      { $inc: { reviews: -1 } }
    );


    return res.status(200).send({
      status: true,
      message: `${reviewIdParams} this review is deleted successfully`,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
