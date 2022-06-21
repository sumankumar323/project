const express=require('express');
const router=express.Router();
const authorController=require('../controller/authorController');
const blogController=require('../controller/blogController');
const middleware=require('../middleware/auth')

router.post("/authors",middleware.authenticate,authorController.createAuthor);//create author

router.post("/blogs",middleware.authenticate,blogController.createBlog);//create blogs

router.get("/blogs",middleware.authenticate,blogController.getBlogs);//get blog details

router.put("/blogs/:blogId",middleware.authorise,blogController.updateBlogs);//get blogs by id and update

router.delete("/blogs/:body",middleware.authorise,blogController.deleteBlogsById);//delete blogs by id

router.delete("/blogs",middleware.authorise,blogController.deleteBlogsByQueryParams);//delete blogs by query params