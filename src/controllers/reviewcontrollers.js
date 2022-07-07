const bookModel = require("../Model/bookmodel");
const reviewModel = require("../Model/reviewmodel");
const validation = require("../validator/validator");
const ObjectId = require("mongoose").Types.ObjectId;

exports.updateReview = async function (req, res) {
  try {
    const bookIdParams = req.params.bookId;
    const reviewIdParams = req.params.reviewId;
    const dataToUpdate = req.body;
    // Validation of Id's from Url
    if (!ObjectId.isValid(bookIdParams))
      return res
        .status(400)
        .send({ status: false, msg: "Not a valid Book id from url." });
    if (!ObjectId.isValid(reviewIdParams))
      return res
        .status(400)
        .send({ status: false, msg: "Not a valid Review id from url." });

    // Finding the book by Id in url
    const findBook = await bookModel
      .findOne({ _id: bookIdParams, isDeleted: false })
      .select({ __v: 0 });
    if (!findBook)
      return res.status(404).send({ status: false, message: "No Book found" });

    // Finding the review by if in url
    const findReview = await reviewModel.findOne({
      _id: reviewIdParams,
      isDeleted: false,
    });
    if (!findReview)
      return res
        .status(404)
        .send({ status: false, message: "No Review found" });

    // verifying review id belongs to the book or not
    const bookIdFromReview = findReview.bookId.toString();
    if (bookIdParams !== bookIdFromReview)
      return res
        .status(400)
        .send({
          status: false,
          messege:
            "The review you want to update not belongs to the book provide in url.",
        });

    // User input validation
    const { reviewedBy, rating, review } = dataToUpdate;
    if (!validation.isValidReqBody(dataToUpdate))
      return res
        .status(400)
        .send({
          status: false,
          message: "Please enter details you want to update.",
        });

    //If Reviewed by is present
if (reviewedBy) {
      if (
        !validation.isValid(reviewedBy) ||
        !validation.isValidName(reviewedBy)
      )
        return res
          .status(400)
          .send({
            status: false,
            message: "ReviewBy Should Contain only alphabets.",
          });
    }
    dataToUpdate["reviewedBy"] = reviewedBy;

    //If Rating by is present
 if (rating) {
      if (rating < 1 || rating > 5 || !validation.isValidRating(rating))
        return res
          .status(400)
          .send({
            status: false,
            message: "Rating must be 1 to 5 numerical value",
          });
    }
    dataToUpdate["rating"] = rating;

    //If Review by is present
if (review) {
      if (!validation.isValid(review))
        return res
          .status(400)
          .send({ status: false, message: "Review is invalid." });
    }
    dataToUpdate["review"] = review;

    // Updating The review details
    const updatedReview = await reviewModel
      .findOneAndUpdate({ _id: reviewIdParams }, dataToUpdate, { new: true })
      .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 });

    // Assigning reviews list with book details
    const booksWithUpdatedReview = findBook.toObject();
    booksWithUpdatedReview["reviewsData"] = updatedReview;

    res
      .status(200)
      .send({
        status: true,
        messege: "Review Updated successfully",
        data: booksWithUpdatedReview,
      });
  } catch (err) {
    return res.status(500).send({ status: false, messege: err.message });
  }
};
//-------********_____.........Add Review -----------***************.....................

exports.addReview = async function (req, res) {
  const bookId = req.params.bookId;
  const queryParams = req.body;
  const { reviewedBy, reviewedAt, rating, review } = queryParams;

  if (validation.isValidReqBody(queryParams)) {
    return res
      .status(400)
      .send({
        status: false,
        message: "Please provide the book review details",
      });
  }
  if (validation.isValidObjectId(bookId)) {
    return res
      .status(400)
      .send({ status: false, message: "Book id is not valid!" });
  }
  if (validation.isValid(reviewedBy)) {
    return res
      .status(400)
      .send({ status: false, message: "Please provide reviewer name!" });
  }

  if (validation.isValidRating(rating)) {
    return res
      .status(400)
      .send({ status: false, message: "Rating scale should be 1 - 5!" });
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

  return res
    .status(201)
    .send({ status: true, message: "Success", data: reviewResponse });
};

//........................**********------------ DELETE books by reviewsId------*******............

exports.deleteReview = async function (req, res) {
  try {
    const bookIdParams = req.params.bookId;
    const reviewIdParams = req.params.reviewId;

    // Validation of ID
    if (!ObjectId.isValid(bookIdParams))
      return res
        .status(400)
        .send({
          status: false,
          message: `${bookIdParams} is not a valid book id`,
        });

    if (!ObjectId.isValid(reviewIdParams))
      return res
        .status(400)
        .send({
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
      return res
        .status(400)
        .send({
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

    // const ChangeReviewCount = newReviewCount.toObject()
    // const reviewList = await reviewModel.find({ bookId: bookId, isDeleted: false })
    // ChangeReviewCount['reviewsData'] = reviewList

    return res
      .status(200)
      .send({
        status: true,
        message: `${reviewIdParams} this review is deleted successfully`,
      });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
