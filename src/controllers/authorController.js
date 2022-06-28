
//........................**********------------REQUIRED    MODULES   AND   PACKAGES ------*******............ 

const jwt = require("jsonwebtoken");
const authorModel = require("../models/authorModel");
var validator = require("email-validator");
let stringPattern=/^[A-Za-z. ]{2,30}$/
let passwordPattern=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  

//........................**********------------ CREATE AUTHOR------*******............ 


const createAuthor = async function (req, res) {
try{
  let data = req.body;
  if(Object.keys(data).length==0){return res.status(400).send({status:false,msg:"no Data Entered"});}
  if(!data.fname){return res.status(400).send({status:false,msg:"fname Must Be Present"});}
  if(!data.fname.match(stringPattern)){return res.status(400).send({status:false,msg:"fname Must Be An Alphabet And Of Atleast Two Characters"});}
  if(!data.lname){return res.status(400).send({status:false,msg:"lname Must Be Present"});}
  if(!data.lname.match(stringPattern)){return res.status(400).send({status:false,msg:"lname Must Be An Alphabet And Of Atleast Two Characters"});}
  if(!data.title){return res.status(400).send({status:false,msg:"title Must Be Present"});}
  if(data.title!="Mr"&&data.title!="Mrs"&&data.title!="Miss"){return res.status(400).send({status:false,msg:"title Must Be Mr,Mrs or Miss"});}
  if(!data.email) { return res.status(400).send({status:false,msg:"email Must Be Present"});}
  if(!validator.validate(data.email)){return res.status(400).send({status:false,msg:"please Enter Valid Email Id"})}
  let email = data.email
  let duplicate = await authorModel.findOne({email : email})
  if(duplicate) return res.status(400).send({status: false, msg : "Email Already Exist In The DataBase."}) 

  if(!data.password){ return res.status(400).send({status:false,msg:"password Must Be Present"});}
  if(!data.password.match(passwordPattern)){return res.status(400).send({status:false,msg:"password Must Contain One Uppercase,Lowercase,Number,Symbol And Minimum Length Should Be 8-Character"});}

  let authorData = await authorModel.create(data);
   return res.status(201).send({ msg: authorData });
  }catch(err){
  return res.status(500).send({status:false,msg:err.message})
 }
};
 


//........................**********------------ AUTHOR LOGIN  ------*******............ 



const authorLogin=async (req,res)=>{
   try{
     let data=req.body
     let authorEmail=data.email;
     let password=data.password;
     if (Object.keys(data).length==0){return res.status(400).send({status:false,msg:"no Data Entered"})}
     if(!authorEmail){return res.status(400).send({status:false,msg:"please Enter Email"})}
     if(!validator.validate(authorEmail)){return res.status(400).send({status:false,msg:"please Enter Valid Email Id"})}
     if(!password){return res.status(400).send({status:false,msg:"please Enter Password"})}
     if(!password.match(passwordPattern)){return res.status(400).send({status:false,msg:"password Must Contain One Uppercase,Lowercase,Number,Symbol And Minimum Length Should Be 8-Character"});}
     let author=await authorModel.findOne({email:authorEmail,password:password});
     if(!author){return res.status(400).send({status:false,msg:"no Such Author Present"})}

     let token=jwt.sign(
      {
        authorId:author._id.toString()
      },
       "group-16"
     );
    return res.status(201).send({status:true,msg:token})
   }catch(err){
   return res.status(500).send({status:false,msg:err.message})
   } 
}
 




module.exports.createAuthor = createAuthor;
module.exports.authorLogin = authorLogin;