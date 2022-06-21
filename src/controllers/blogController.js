const jwt = require("jsonwebtoken");
const blogModel = require("../models/blogModel");

const createBlog = async (req, res)=>{

    let data = req.body;
    let blogData = await blogModel.create(data);
    res.status(201).send({ msg: blogData });
  };

const getBlogs=async(req,res)=>{
     let requestedData=req.params;
     let blog=await blogModel.find(requestedData)
     if(!blog){
         res.status(404).send({status:false,msg:"no Such Blog Exists"})
     }
     else{
        res.status(200).send({status:true,msg:blog})
     }
};


const updateBlog = async (req, res)=> {
    let blogId = req.params.blogId;
    let user = await blogModel.findById(blogId);
   
    if (!user) {
      return res(404).send({status:false,msg:"No such blog exists"});
    }
    if (user.isDeleted==true){
        return res(404).send({status:false,msg:"blog is deleted"})
    }
  
    let  blogData= req.body;
    let updatedBlog = await blogModel.findOneAndUpdate({ _id: blogId }, blogData, {new: true});
    res.send({ status: updatedBlog, data: updatedBlog });
  };

  const deleteBlogById = async (req, res) =>{    
    let blogId = req.params.blogId
    let blog = await blogModel.findById(blogId)
   if(!blog) {
        return res(404).send({status: false, message: "no such blog exists"})
    }
    let updatedBlog = await blogModel.findOneAndUpdate({_id: blogId}, {isDeleted: true}, {new: true})
    res.status(200).send({status: true, data: updatedBlog})
  } 

  const deleteBlogByQueryParams= async (req, res)=> {    
    let blogData = req.query.params
    let blog = await blogModel.find(blogData)
   if(!blog) {
        return res(404).send({status: false, message: "no such blog exists"})
    }
    let updatedBlog = await blogModel.findOneAndUpdate({_id: blogId}, {isDeleted: true}, {new: true})
    res.status(200).send({status: true, data: updatedBlog})
  } 

  module.exports.createBlog = createBlog;
  module.exports.getBlogs = getBlogs;
  module.exports.updateBlog = updateBlog;
  module.exports.deleteBlogById = deleteBlogById;
  module.exports.deleteBlogByQueryParams = deleteBlogByQueryParams;