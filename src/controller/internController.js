const internModel = require("../models/internModel.js")
const collegeModel = require("../models/collegeModel.js")
const validateEmail = require("email-validator")  //import email-validator package

let validString = /^[ a-z ]+$/i; //To validate String using RegEx

const isValid = function (value) {   //function to check entered data is valid or not
    if (typeof value == "undefined" || value == null) return false;
    if (typeof value == "string" && value.trim().length === 0) return false;
    return true;
}


//===================================================[API:FOR CREATING INTERN DB]===========================================================

exports.createIntern = async function (req, res) {
    try {
         if (Object.keys(req.query).length == 0) {
             let internDetails = req.body;  //getting data from request body

            if (Object.keys(internDetails).length == 0) { //validating is there any data inside request body
                res.status(400).send({ status: false, message: " No Intern Detail Received" });
                return
            }
            const { name, email, mobile, collegeName } = internDetails; //Destructuring data coming from request body

            //here performing validation for data
            if (!isValid(name) || !name.match(validString)) {
                res.status(400).send({ status: false, msg: "Name is required and enter the correct format" });
                return
            }
            if (!isValid(email)) {
                res.status(400).send({ status: false, msg: " email is required" });
                return
            }

            //checking if the email is valid by using email-validator package
            if (!validateEmail.validate(email)) return res.status(400).send({ status: false, msg: "Enter a valid email" })

            if (!isValid(mobile)) {
                res.status(400).send({ status: false, msg: " mobile is required" });
                return
            }
            if (!/^[6-9]\d{9}$/.test(mobile)) {  //validating mobile no. using regEx
                res.status(400).send({ status: false, message: "Please provide valid mobile number" });
                return;
            }
            //Checking entered mobile no. and email is unique or not
            let uniqueValue = await internModel.findOne({ $or: [{ email: internDetails.email }, { mobile: internDetails.mobile }] });
            if (uniqueValue) return res.status(400).send({ status: false, msg: "email or mobile already Used" })
            //validation for collageName 
            if (!isValid(collegeName) || !collegeName.match(validString)) {
                res.status(400).send({ status: false, msg: " college name is required and enter valid college name" });
                return
            }
            //checking entered collegeName exist or not
            const getCollegeData = await collegeModel.findOne({ name: internDetails.collegeName }).select({ _id: 1 });
            if (!getCollegeData) return res.status(404).send({ status: false, msg: "College name does not exist" })
            internDetails.collegeId = getCollegeData._id  //storing object id of college in intern detail

            internData = await internModel.create(internDetails)  //creating document after clearing all the validation
            let Intern = {    //storing all data in an object
                "isDeleted": internData.isDeleted,
                "name": internData.name,
                "email": internData.email,
                "mobile": internData.mobile,
                "collegeId": `ObjectId(${internData.collegeId})`
            }
            return res.status(201).send({ status: true, data: Intern })
         }
          else {
           return res.status(400).send({ status: false, message: "Invalid request you can't provide data in query" });
          }
    } catch (err) {
        console.log("This is the error:", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}





