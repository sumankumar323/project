 
const mongoose=require("mongoose")
const blogModel = require("../models/blogModel");
const authorModel = require("../models/authorModel");
const jwt = require("jsonwebtoken");


//........................**********------------ CREATE BLOG ------*******............ 
 


const createBlog = async (req, res) => {
  try {
    let data = req.body;
    if (Object.keys(data).length ==0) {
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
  if (!data.category) {
    return res
      .status(400)
      .send({ status: false, msg: "no Category Entered" });
  }
    if (
      !mongoose.isValidObjectId(data.authorId)
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
    let createdData = await blogModel.find(blogData).select({ authorId: 0});
     return res.status(201).send({ msg: createdData });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};
 


//........................**********------------ GET BLOG ------*******............ 



const getBlogs = async (req, res) => {
  try {
    let requestedData = req.query;
    let blog = await blogModel
      .find({ isDeleted: false, isPublished: true })
      .find(requestedData);
    console.log(blog);
    if (!blog){
     return res.status(404).send({ status: false, msg: "no Such Blog Exists" });
    }
     return res.status(200).send({ status: true, msg: blog });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};


//........................**********------------ UPDATE BLOG------*******............ 
 


const updateBlog = async (req, res) =>{
  try {
    let blogData = req.body;
    let blogId = req.params.blogId;
    
    if (Object.keys(blogData).length==0) {
      return res.status(400).send({ status: false, msg: "No Data Entered" });
    }
    if (!blogId) {
      return res.status(400).send({ status: false, msg: "No Blog Id Entered" });
    }

    if (!mongoose.isValidObjectId(blogId)) {
      return res
        .status(400)
        .send({ status: false, msg:" blogId Is Incorrect" });
    }
     let modifyData=blogData

     if(blogData.title){blogData.title=modifyData.title}
     else{return res.status(400).send({status:false,msg:"please Check The Title Field"})}

     if(blogData.body){blogData.body=modifyData.body}
     else{return res.status(400).send({status:false,msg:"please Check The Body Field"})}

     if(blogData.tags){blogData.tags=modifyData.tags}
     else{return res.status(400).send({status:false,msg:"please Check The Tags Field"})}

     if(blogData.category){blogData.category=modifyData.category}
     else{return res.status(400).send({status:false,msg:"please Check The Category Field"})}

     if(blogData.subcategory){blogData.subcategory=modifyData.subcategory}
     else{return res.status(400).send({status:false,msg:"please Check The subcategory Field"})}
     
     let token = req.headers["x-api-key"];
      if(!token){token=req.headers["x-Api-Key"]}
      let decodedToken = jwt.verify(token, "group-16");
 
    
    let verifyAuthor= await blogModel.findOne({_id:blogId}).select({authorId:1})
    if(!verifyAuthor){return res.status(404).send({status:false,msg:"author Has No Such Blogs"})}
    if(verifyAuthor.authorId!=decodedToken.authorId){
      return res.status(401).send({status:false,msg:"author Is Not Authorised For The Modification Of This Blog"})
    }
  
    console.log(verifyAuthor.authorId)
    let updatedBlog = await blogModel.findOneAndUpdate(
      { _id: blogId },
      {
        $push: { tags: modifyData.tags, subcategory: modifyData.subcategory },
        $set: {
          body: modifyData.body,
          title: modifyData.title,
          category: modifyData.category,
          publishedAt: Date(),
          isPublished: true,
        },
      },
      { new: true })
      console.log(updatedBlog)
    

    if (!updatedBlog) {
      return res
        .status(400)
        .send({ status: false, msg: "no Such  Blog Exists" });
    }
 
      return res
        .status(200)
        .send({ status: false, msg: updatedBlog });
    
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  } 
};
 

//........................**********------------ DELETE BY BLOGID ------*******............ 



const deleteBlogById = async (req,res) => {
  try {
    let blogId = req.params.blogId;
    if (!blogId){
      return res
        .status(400)
        .send({ status: false, message: "please Enter The Blog Id" });
    }
    if (!mongoose.isValidObjectId(blogId)) {
      return res
        .status(400)
        .send({ status: false, msg: " blogId Is Incorrect" });
    }
    let token = req.headers["x-api-key"];
    if(!token){token=req.headers["x-Api-Key"]}
    let decodedToken = jwt.verify(token, "group-16");
    
    let verifyAuthor=await blogModel.findById({_id:blogId}).select({authorId:1})
    if(!verifyAuthor){return res.status(404).send({status:false,msg:"author Has No Such Blogs"})}
    if(verifyAuthor!=decodedToken.authorId){return res.status(401).send("author Is Not Authorised For The Modification Of This Blog")}
  
    let deletedBlog = await blogModel.findOneAndUpdate(
      {_id: blogId, isDeleted: false },
      { isDeleted: true,deletedAt:new Date()},
      { new: true }
    );
    res.status(200).send({ status: true, data: "blog is deleted" });
    if (!deletedBlog) {
      return res
        .status(404)
        .send({ status: false, message: "no such blog exists" });
    }
  }
   catch (err) {
   return res.status(500).send({ status: false, msg: err.message });
  }
}
   

//........................**********------------ DELETE BY QUERY PARAM ------*******............ 


const deleteBlogByQueryParams = async (req, res) => {
  try {
    let blogData = req.query;
    if (Object.keys(blogData).length == 0) {
      return res
        .status(400)
        .send({ status: false, msg: "please Enter the Query Parameters For Updations" });
    }
    let token = req.headers["x-api-key"];
    let decodedToken = jwt.verify(token, "group-16");
    if (blogData.authorId) {
      if (blogData.authorId != decodedToken.authorId) {
        return res
          .status(400)
          .send({
            status: false,
            message:
              "the Blog Which Author Is Trying To Modify Is Not His Blog",
          });
      }
    }
let deletedBlog = await blogModel
       .find({authorId:decodedToken.authorId})
       .find(blogData)
       .updateMany({ isDeleted:false}, { isDeleted: true ,deletedAt:new Date()}, { new: true });
    console.log(deletedBlog);
    

    if (!deletedBlog) {
      return res
        .status(404)
        .send({ status: false, message: "no such blog exists" });
    }
   res.status(200).send({ status: true, data: "blog Has Been Deleted" });
  } catch (err) {
   return res.status(500).send({ status: false, msg: err.message });
  }
};
 




module.exports.createBlog = createBlog;
module.exports.getBlogs = getBlogs;
module.exports.updateBlog = updateBlog;
module.exports.deleteBlogById = deleteBlogById;
module.exports.deleteBlogByQueryParams =deleteBlogByQueryParams;