const usermodel = require('../Model/usermodel');

exports.createUser= async function(req,res){
    try{
        const data = req.body;

        if(Object.keys(data).length==0){
            res.status(400).send({status:false,message:"No user data recieved"})
        }

        const{title,name,phone,email,password,address} = data;

        if(!data.title){
            res.status(400).send({status:false,message:"Title is required!"})
        }
        if(!data.name){
            res.status(400).send({status:false,message:"Name is required!"})
        }
        if(!data.phone){
            res.status(400).send({status:false,message:"Phone is required!"})
        }
        if(!data.email){
            res.status(400).send({status:false,message:"Email is required!"})
        }
        if(!data.password){
            res.status(400).send({status:false,message:"password is required!"})
        }
        if(!/^[a-zA-Z0-9!@#$%^&*]{8,}$/.test(password)){
            res.status(400).send({status:false,message:"password should be minimum 8 character!"})
        }
        if(!/^[a-zA-Z0-9!@#$%^&*]{,15}$/.test(password)){
            res.status(400).send({status:false,message:"password should be maximun 15 character!"})
        }

        const user = await usermodel.create(data)

        res.status(201).send({status:true,message:'Success',data:user})
    }
    catch(err){
        console.log(err.message)

    }
}