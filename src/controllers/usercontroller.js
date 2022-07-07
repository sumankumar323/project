const usermodel = require('../Model/usermodel');

const jwt = require("jsonwebtoken");


const isValid = function (value) {

    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
createUser = async function (req, res) {
    try {
        const data = req.body;

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "No user data recieved" })
        }

        const { title, name, phone, email, password, address } = data;

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Title is required!" })
        }
        if (["Mr", "Mrs", "Miss"].indexOf(title) == -1) {
            return res.status(400).send({ status: false, message: "Title is Not correct!" })
        }
        if (!isValid(name)) {
            return res.status(400).send({ status: false, message: "Name is required!" })
        }
        if (!/^[a-zA-Z ]{3,20}$/.test(name)) {
            return res.status(400).send({ status: false, message: "Name is not valid!" })
        }
        const uniquePhone = await usermodel.findOne({ phone: phone })
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "Phone is required!" })
        }
        if (!/^[6-9]{1}[0-9]{9}$/.test(phone)) {
            return res.status(400).send({ status: false, message: "Phone is not valid!" })
        }
        if (uniquePhone) {
            return res.status(400).send({ status: false, message: "Phone is already exists!" })
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required!" })
        }
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: "Email is not correct!" })
        }
        
        const uniqueEmail = await usermodel.findOne({ email: email })
        if (uniqueEmail) {
            return res.status(400).send({ status: false, message: "Email is already exists!" })
        }
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required!" })
        }
        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "password should be between 8 to 15 character!" })
        }


        const user = await usermodel.create(data)

        return res.status(201).send({ status: true, message: 'Success', data: user })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const userLogin = async (req, res) => {
    const data = req.body

    const { email, password } = data

    if (Object.keys(data).length == 0) {
        return res.status(400).send({ status: false, message: "No user login data recieved" })
    }

    if (!isValid(email)) {
        return res.status(400).send({ status: false, message: "Email is required!" })
    }

    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
        return res.status(400).send({ status: false, message: "Email is not correct!" })
    }
    if (!isValid(password)) {
        return res.status(400).send({ status: false, message: "password is required!" })
    }
    if (password.length < 8 || password.length > 15) {
        return res.status(400).send({ status: false, message: "password should be between 8 to 15 character!" })
    }

    const loginData = await usermodel.findOne(data)

    if (!loginData) {
        return res.status(404).send({ status: false, message: "Invalid login credentials!" })
    }

    const userid = loginData._id.toString()

    const token = jwt.sign({
        userId: userid,
        iat: Math.floor(Date.now() / 1000),
  
    }, "group no 54",{
        expiresIn:'1h'
    });

    res.status(200).send({ status: true, message: 'Success', data: token })


}
module.exports.createUser = createUser
module.exports.userLogin = userLogin