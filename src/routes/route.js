
const express=require('express');
const router=express();
const authorController=require('../controllers/authorController');
const blogController=require('../controllers/blogController');
const middleware=require('../middleware/auth')
 


router.post("/authors",authorController.createAuthor);//create author

router.post("/blogs",middleware.authenticate,blogController.createBlog);//create blogs

router.get("/blogs",middleware.authenticate,blogController.getBlogs);//get blog details

router.put("/blogs/:blogId",middleware.authenticate,middleware.authorise,blogController.updateBlog);//get blogs by id and update

router.delete("/blogs/:blogId",middleware.authenticate,middleware.authorise,blogController.deleteBlogById);//delete blogs by id

router.delete("/blogs",middleware.authenticate,middleware.authorise,blogController.deleteBlogByQueryParams);//delete blogs by query params

router.post("/login",authorController.authorLogin);//author login
 


module.exports=router;