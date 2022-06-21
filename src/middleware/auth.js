const jwt = require("jsonwebtoken");

const authenticate   = function(req, res, next) {
    try{
    let token = req.headers["x-Auth-token"];
    if (!token) token = req.headers["x-auth-token"];
  
    if (!token) return res.status(404).send({ status: false, msg: "token must be present" });
   console.log(token);

    let decodedToken = jwt.verify(token, "functionup-radon");

   }catch(error){
       res.status(400).send({msg: false, error:error.message})  
   }
    next()
    
}

const authorise = function(req, res, next) {
    try{
    let token = req.headers["x-auth-token"]
    if(!token) return res.status(400).send({status: false, msg: "token must be present in the request header"})
   
    let decodedToken = jwt.verify(token, 'functionup-radon')
    console.log(decodedToken)

    let userToBeModified = req.params.userId
 
    let userLoggedIn = decodedToken.userId
  
    if(userToBeModified != userLoggedIn) return res.send({status: false, msg: 'User logged is not allowed to modify the requested users data'})
  
    }catch(error){
      res.status(403).send({msg:false,error:error.message})
   }
    next()
}

module.exports.authenticate =authenticate 
module.exports.authorise =authorise
