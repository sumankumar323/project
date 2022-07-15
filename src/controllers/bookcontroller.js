//Importing Required Modules & Packeges
const bookModel = require("../Model/bookmodel");
const reviewModel = require("../Model/reviewmodel");
const validation = require("../validator/validator");
const userModel = require("../Model/usermodel");
const ObjectId = require("mongoose").Types.ObjectId;
const aws= require("aws-sdk");


//-----------------------------------------------------------------------Create Book Api----------------------------------------------------------------------//
const createBook = async function (req, res) {
  try {


    aws.config.update({
      accessKeyId: "AKIAY3L35MCRVFM24Q7U",
      secretAccessKey: "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",
      region: "ap-south-1"
  })
  
  let uploadFile= async ( file) =>{
     return new Promise( function(resolve, reject) {
      // this function will upload file to aws and return the link
      let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws
  
      var uploadParams= {
          ACL: "public-read",
          Bucket: "classroom-training-bucket",  //HERE
          Key: "abc/" + file.originalname, //HERE 
          Body: file.buffer
      }
  
  
      s3.upload( uploadParams, function (err, data ){
          if(err) {
              return reject({"error": err})
          }
          console.log(data)
          console.log("file uploaded succesfully")
          return resolve(data.Location)
      })
  
     })
  }
  
  let files= req.files
  console.log(files)
  if(files && files.length>0){
  
      let uploadedFileURL= await uploadFile( files[0] )
      
     // return res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
     let data = req.body;
     req.body.bookCover=uploadedFileURL
     let book = await bookModel.create(data);
     return res.status(201).send({ Status: true, message: "Success", data: book });
  }
  else{
      return res.status(400).send({ msg: "No file found" })
  }
    const data = req.body;
    // Validate Request Body
    if (!validation.isValidReqBody(data))
      return res
        .status(400)
        .send({ status: false, message: "No input by user." });
    // Destructuring request body
    const {
      title,
      excerpt,
      userId,
      ISBN,
      category,
      subcategory,
      releasedAt,
      isDeleted,
    } = data;

    // Validate title
    if (!validation.isValid(title))
      return res
        .status(400)
        .send({ status: false, message: "Book title is required" });
    if (!validation.isValidName(title))
      return res.status(400).send({
        status: false,
        message:
          "Title is invalid(Should Contain Alphabets, numbers, quotation marks & [@ , . ; : ? & ! _ - $]",
      });

    const uniqueTitle = await bookModel.findOne({ title });
    if (uniqueTitle)
      return res
        .status(400)
        .send({ status: false, message: "Title already exists" });

    // Validate excerpt
    if (!validation.isValid(excerpt))
      return res
        .status(400)
        .send({ status: false, message: "Book excerpt is required" });
    if (!validation.isValidName(excerpt))
      return res.status(400).send({
        status: false,
        message: "excerpt is not valid(Should cointain alphabets only)",
      });

    // Validate userId
    if (!validation.isValid(userId))
      return res
        .status(400)
        .send({ status: false, message: "userId is required" });
    if (!ObjectId.isValid(userId))
      return res
        .status(400)
        .send({ status: false, message: "Not a valid user id" });

    const validUser = await userModel.findById({ _id: userId });
    if (!validUser)
      return res
        .status(404)
        .send({ status: false, message: "UserId doesn't exist" });

    // Validate ISBN
    if (!validation.isValid(ISBN))
      return res
        .status(400)
        .send({ status: false, message: "ISBN is required" });
    if (!validation.isValidISBN(ISBN))
      return res.status(400).send({
        status: false,
        message: "Not a Valid ISBN. (Only 10 or 13 digit number.)",
      });

    const uniqueISBN = await bookModel.findOne({ ISBN: ISBN });
    if (uniqueISBN)
      return res
        .status(400)
        .send({ status: false, message: "ISBN already exists" });

    //Validate category
    if (!validation.isValid(category))
      return res
        .status(400)
        .send({ status: false, message: "category is required" });
    if (!validation.isValidName(category))
      return res.status(400).send({
        status: false,
        message: "Category is not valid(Should cointain alphabets only)",
      });

    //------------------------------------------------------------------
    //Validate subcategory
    if (!validation.isValid(subcategory))
      return res
        .status(400)
        .send({ status: false, message: "Subcategory is required" });
    if (typeof subcategory == "object") {
      for (let i = 0; i < subcategory.length; i++) {
        if (!validation.isValid(subcategory[i]))
          return res
            .status(400)
            .send({ status: false, message: "SUB-CATEGORY IS NOT VALID" });
      }
    }
    if (!validation.isValidName(subcategory))
      return res.status(400).send({
        status: false,
        message:
          "Subcategory is invalid (Should Contain Alphabets, numbers, quotation marks  & [@ , . ; : ? & ! _ - $].",
      });
    let subArray = subcategory.split(",");
    data["subcategory"] = subArray;

    //Validate releasedAt
    if (!validation.isValid(releasedAt))
      return res
        .status(400)
        .send({ status: false, message: "Release date is Required" });
    if (!validation.isValidRelAt(releasedAt))
      return res.status(400).send({
        status: false,
        message: "Date should be valid & format will YYYY-MM-DD",
      });

    // Can't Set deleted true at creation time
    if (isDeleted == true)
      return res.status(400).send({
        status: false,
        message: "You can't add this key at book creation time.",
      });

    // const bookData = { title, excerpt, userId, ISBN, category, bookCover, subcategory, releasedAt }

    //Authorization
    const userIdFromToken = req.userId;
    if (userIdFromToken !== userId)
      return res
        .status(403)
        .send({ status: false, message: "Unauthorized Access." });

    const savedBook = await bookModel.create(data);
    return res.status(201).send({
      status: true,
      message: "Book Created Successfully",
      data: savedBook,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//-----------------------------------------------------------------------Get books by query-------------------------------------------------------------------//
const getBooks = async function (req, res) {
  try {
    const userQuery = req.query;
    // If no query find all active blogs
    const filter = { isDeleted: false };
    const { userId, category, subcategory } = userQuery;

    // Validation of user id and adding to query
    if (userId) {
      if (!validation.isValidObjectId(userId)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid UserId." });
      } else {
        filter["userId"] = userId;
      }
    }
    //If category is present on query
    if (validation.isValid(category)) {
      filter["category"] = category.trim();
    }
    //If Subcategory is present in query
    if (validation.isValid(subcategory)) {
      const subCategoryArray = subcategory
        .trim()
        .split(",")
        .map((s) => s.trim());
      filter["subcategory"] = { $in: subCategoryArray };
    }

    const findBooks = await bookModel.find(filter).select({
      title: 1,
      excerpt: 1,
      userId: 1,
      category: 1,
      reviews: 1,
      releasedAt: 1,
      subcategory: 1,
    });

    if (findBooks.length === 0)
      return res
        .status(404)
        .send({ status: false, message: "No Book(s) found." });

    // Sorting title alphabetically
    const sortedBooks = findBooks.sort((a, b) =>
      a.title.localeCompare(b.title)
    );

    res
      .status(200)
      .send({ status: true, message: "Books list", data: sortedBooks });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//---------------------------------------------------------------Get Book Reviews by ID----------------------------------------------------------------------//
const getReviewDetails = async function (req, res) {
  try {
    const bookId = req.params.bookId;
    // Book id validation
    if (!ObjectId.isValid(bookId))
      return res
        .status(400)
        .send({ status: false, message: "Not a valid book id" });

    // Find Book
    const getBook = await bookModel
      .findOne({ _id: bookId, isDeleted: false })
      .select({ __v: 0 });
    if (!getBook)
      return res
        .status(404)
        .send({ status: false, message: "No book(s) found." });

    // Find Books Reviews
    const getReviews = await reviewModel
      .find({ bookId: bookId, isDeleted: false })
      .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 });

    //Assigning reviewdata key
    let booksWithReview = getBook.toObject();
    booksWithReview["reviewsData"] = getReviews;

    res
      .status(200)
      .send({ status: true, message: "Book List", data: booksWithReview });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//---------------------------------------------------------------Update Book By ID API-----------------------------------------------------------------------//
const updatebook = async function (req, res) {
  try {
    const bookIdParams = req.params.bookId;
    const dataToUpdate = req.body;
    const loggedUserId = req.userId;

    // Id Validation
    if (!ObjectId.isValid(bookIdParams))
      return res
        .status(400)
        .send({ status: false, message: "Not a valid Book Id" });
    if (!ObjectId.isValid(loggedUserId))
      return res
        .status(400)
        .send({ status: false, message: "Not a valid User Id in token." });

    // Finding Books
    const findBook = await bookModel.findOne({
      _id: bookIdParams,
      isDeleted: false,
    });
    if (!findBook)
      return res.status(404).send({ status: false, message: "No book found." });

    // Authorization
    const requestUserId = findBook.userId;
    if (loggedUserId !== requestUserId.toString())
      return res
        .status(403)
        .send({ status: false, message: "Unauthorized access" });

    // Destructuring
    const { title, excerpt, releasedAt, ISBN } = dataToUpdate;
    if (!validation.isValidReqBody(dataToUpdate))
      return res.status(400).send({
        status: false,
        message: "Please enter details you want to update.",
      });

    // If title is present
    if (title) {
      if (!validation.isValid(title) || !validation.isValidName(title))
        return res.status(400).send({
          status: false,
          message:
            "Title is invalid (Should Contain Alphabets, numbers, quotation marks  & [@ , . ; : ? & ! _ - $].",
        });

      const uniqueTitle = await bookModel.findOne({ title });
      if (uniqueTitle)
        return res
          .status(400)
          .send({ status: false, message: "Title is already present." });
    }
    dataToUpdate["title"] = title;

    // If ISBN is present
    if (ISBN) {
      if (!validation.isValidISBN(ISBN))
        return res.status(400).send({
          status: false,
          message: "Not a Valid ISBN. (Only 10 or 13 digit number.)",
        });

      const uniqueISBN = await bookModel.findOne({ ISBN });
      if (uniqueISBN)
        return res
          .status(400)
          .send({ status: false, message: "ISBN is already present." });
    }
    dataToUpdate["ISBN"] = ISBN;

    // If Releaded date is present
    if (releasedAt) {
      if (!validation.isValidDate(releasedAt))
        return res.status(400).send({
          status: false,
          message: "Date should be valid & format will YYYY-MM-DD",
        });
    }
    dataToUpdate["releasedAt"] = releasedAt;

    // If excerpt is present
    if (excerpt) {
      if (!validation.isValid(excerpt))
        return res
          .status(400)
          .send({ status: false, message: "Please enter a valid excerpt." });
    }
    dataToUpdate["excerpt"] = excerpt;

    // Final data Updation
    const updatedDetails = await bookModel.findOneAndUpdate(
      { _id: bookIdParams },
      dataToUpdate,
      { new: true }
    );
    res.status(200).send({
      status: true,
      msg: "Book details updated successfully",
      data: updatedDetails,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//---------------------------------------------------------------Delete Book By ID API-----------------------------------------------------------------------//
const deleteBook = async function (req, res) {
  try {
    const bookId = req.params.bookId;

    // Id validation
    if (!ObjectId.isValid(bookId))
      return res
        .status(400)
        .send({ status: false, message: "Please provide the valid bookId" });

    // Finding the book
    const findDeletedBook = await bookModel.findOne({
      _id: bookId,
      isDeleted: false,
    });
    if (!findDeletedBook)
      return res.status(404).send({ status: false, message: "Book not found" });

    // Authorization
    const userIdFromToken = req.userId;
    if (userIdFromToken !== findDeletedBook.userId.toString())
      return res
        .status(403)
        .send({ status: false, message: "Unauthorized Access." });

    // Book delete
    const deletedBook = await bookModel.findOneAndUpdate(
      { _id: bookId },
      { $set: { isDeleted: true, deletedAt: new Date(), reviews: 0 } },
      { new: true }
    );

    // Delete all reviews of this book
    const deleteBookReviews = await reviewModel
      .find({ bookId: bookId, isDeleted: false })
      .updateMany({ $set: { isDeleted: true } });

    res.status(200).send({
      status: true,
      message: "Book & Reviews of the book are Deleted",
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// Exporting Modules
module.exports = {
  createBook,
  getBooks,
  getReviewDetails,
  updatebook,
  deleteBook,
};
