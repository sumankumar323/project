 
const jwt = require("jsonwebtoken");
const blogModel = require("../models/blogModel");
  


//........................**********------------ AUTHENTICATION ------*******............ 



const authenticate = function (req, res, next) {
  try {
    let token = req.headers["x-Api-Key"];
    if (!token) token = req.headers["x-api-key"];
    console.log(token);
    if (!token)
      return res
        .status(404)
        .send({ status: false, msg: "token must be present" });
     
  } catch (error) {
   return res.status(500).send({ msg: false, error: error.message });
  }
  next();
};
 

//........................**********------------AUTHORIZATION ------*******............ 



const authorise = async function (req, res, next) {
  try {
    let token = req.headers["x-Api-Key"];
    if (!token) token = req.headers["x-api-key"];

    let decodedToken = jwt.verify(token,"group-16");
    console.log(decodedToken);
    if (!decodedToken) {
      return res.status(404).send({ status: false, msg: "token must be present" });
    }

    let blogId = req.params.blogId;
    let author_Id = decodedToken.authorId;
    
    let authorValid = await blogModel.find({
      authorId: author_Id,
      blogId: blogId,
    });
    
    if (!authorValid) {
      return res.status(404).send({
        status: false,
        msg: "author logged in has no blogs for modification ",
      });
        }
  } catch (error) {
   return res.status(500).send({ msg: false, error: error.message });
  }
  next();
};
 






module.exports.authenticate = authenticate;
module.exports.authorise = authorise;
