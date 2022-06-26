///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////    REQUIRED   MODULES     ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const blogModel = require("../models/blogModel");
const authorModel = require("../models/authorModel");
const jwt = require("jsonwebtoken");

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////     CREATE   BLOG       /////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const createBlog = async (req, res) => {
  try {
    let data = req.body;
    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: "no Data Entered" });
    }
    if (!data.title) {
      return res.status(400).send({ status: false, msg: "no Title Entered" });
    }
    if (!data.body) {
      return res.status(400).send({ status: false, msg: "no Body Entered" });
    }
    if (!data.authorId) {
      return res
        .status(400)
        .send({ status: false, msg: "no AuthorId Entered" });
    }
    if (
      Object.keys(data.authorId).length < 24 ||
      Object.keys(data.authorId).length > 24
    ) {
      return res
        .status(400)
        .send({ status: false, msg: " authorId Is Incorrect" });
    }
    if (!data.category) {
      return res
        .status(400)
        .send({ status: false, msg: "no Category Entered" });
    }

    let authId = await authorModel.findById(data.authorId);
    if (!authId) {
      return res
        .status(404)
        .send({ status: false, msg: "no Such Author Exists" });
    }
    let blogData = await blogModel.create(data);
    let createdData = await blogModel.find(blogData).select({ authorId: 0 });
    res.status(201).send({ msg: createdData });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////     GET    BLOGS    BY    QUERY    PARAMS      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getBlogs = async (req, res) => {
  try {
    let requestedData = req.query;
    let blog = await blogModel
      .find({ isDeleted: false, isPublished: true })
      .find(requestedData);
    console.log(blog);
    if (!blog) {
      res.status(404).send({ status: false, msg: "no Such Blog Exists" });
    }
    res.status(200).send({ status: true, msg: blog });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////    UPDATE   BLOG   BY   ID    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const updateBlog = async (req, res) => {
  try {
    let blogData = req.body;
    let blogId = req.params.blogId;

    if (Object.keys(blogData).length == 0) {
      return res.status(404).send({ status: false, msg: "No Data Entered" });
    }
    if (!blogId) {
      return res.status(404).send({ status: false, msg: "No Blog Id Entered" });
    }

    let updatedBlog = await blogModel.findOneAndUpdate(
      { _id: blogId, isDeleted: false },
      {
        $push: { tags: blogData.tags, subcategory: blogData.subcategory },
        $set: {
          body: blogData.body,
          title: blogData.title,
          category: blogData.category,
          publishedAt: Date(),
          isPublished: true,
        },
      },
      { new: true }
    );

    if (!updatedBlog) {
      return res
        .status(400)
        .send({ status: false, msg: "unable To Save Blog Data" });
    }

    if (
      blogData.tags &&
      blogData.body &&
      blogData.title &&
      blogData.category &&
      blogData.subcategory
    ) {
      (blogData.tags = updatedBlog.tags),
        (blogData.body = updatedBlog.body),
        (blogData.title = updatedBlog.title),
        (blogData.category = updatedBlog.category),
        (blogData.subcategory = updatedBlog.subcategory);
    } else {
      return res
        .status(404)
        .send({ status: false, msg: "wrong Key Has Been Entered" });
    }

    res.status(200).send({ status: true, data: updatedBlog });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////    DELETE  BLOG  BY  ID      //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteBlogById = async (req, res) => {
  try {
    let blogId = req.params.blogId;
    if (!blogId) {
      return res
        .status(400)
        .send({ status: false, message: "please Enter The Blog Id" });
    }
    let deletedBlog = await blogModel.findOneAndUpdate(
      { _id: blogId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    res.status(200).send({ status: true, data: "blog is deleted" });
    if (!deletedBlog) {
      return res
        .status(404)
        .send({ status: false, message: "no such blog exists" });
    }
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////   DELETE   BLOGS    BY  QUERY   PARAM    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteBlogByQueryParams = async (req, res) => {
  try {
    let blogData = req.query;
    if (Object.keys(blogData).length == 0) {
      return res
        .status(400)
        .send({ status: false, msg: "please Enter the Query Parameters" });
    }
    let token = req.headers["x-api-key"];
    let decodedToken = jwt.verify(token, "group-16");
    if (blogData.authorId) {
      if (blogData.authorId != decodedToken.authorId) {
        return res
          .status(404)
          .send({
            status: false,
            message:
              "the Blog Which Author Is Trying To Modify Is Not His Blog",
          });
      }
    }
    let deletedBlog = await blogModel
      .find(blogData)
      .updateMany({ isDeleted: false }, { isDeleted: true }, { new: true });
    console.log(deletedBlog);

    if (!deletedBlog) {
      return res
        .status(404)
        .send({ status: false, message: "no such blog exists" });
    }
    res.status(200).send({ status: true, data: "blog Has Been Deleted" });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////    MODULE  EXPORTED   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports.createBlog = createBlog;
module.exports.getBlogs = getBlogs;
module.exports.updateBlog = updateBlog;
module.exports.deleteBlogById = deleteBlogById;
module.exports.deleteBlogByQueryParams = deleteBlogByQueryParams;
