const jwt = require("jsonwebtoken");
const authorModel = require("../models/authorModel");

const createAuthor = async function (req, res) {

  let data = req.body;
  let authorData = await authorModel.create(data);
  res.status(201).send({ msg: authorData });
  
  let token=jwt.sign(
    {
      authorId:author_.id.toString(),
      

    }
  )
};


const updateUser = async function (req, res) {
  let userId = req.params.userId;
  let user = await userModel.findById(userId);
  //Return an error if no user with the given id exists in the db
  if (!user) {
    return res.send("No such user exists");
  }

  let userData = req.body;
  let updatedUser = await userModel.findOneAndUpdate({ _id: userId }, userData, {new: true});
  res.send({ status: updatedUser, data: updatedUser });
};

const deleteUser = async function(req, res) {    
  let userId = req.params.userId
  let user = await userModel.findById(userId)
  if(!user) {
      return res.send({status: false, message: "no such user exists"})
  }
  let updatedUser = await userModel.findOneAndUpdate({_id: userId}, {isDeleted: true}, {new: true})
  res.send({status: true, data: updatedUser})
}


const postMessage = async function (req, res) {
 
    let user = await userModel.findById(req.params.userId)
    if(!user) return res.send({status: false, msg: 'No such user exists'})
    
    let message = req.body.message
    let updatedPosts = user.posts
    //add the message to user's posts
    updatedPosts.push(message)
    let updatedUser = await userModel.findOneAndUpdate({_id: user._id},{posts: updatedPosts}, {new: true})

    //return the updated user document
    return res.send({status: true, data: updatedUser})
}

module.exports.createAuthor = createAuthor;
module.exports.getUserData = getUserData;
module.exports.updateUser = updateUser;
module.exports.loginUser = loginUser;
module.exports.deleteUser = deleteUser;
module.exports.postMessage = postMessage;
