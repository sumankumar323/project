const urlModel=require("../model/urlModel");
const shortId=require("shortid");
const validator=require("url-validator")
 const isValid=function(value){
    if(typeof value=="undefined"  || value===null) return false;
    if(typeof value==="string" && value.trim().length==0) return false;
    return true;
 }


const shortUrl=async function(req,res){
   try{
    let data=req.body

    if(Object.keys(data).length==0) return res.status(400).send({status:false,message:"plese Provide key in body"});
      let {longUrl} =data

    if(!isValid(longUrl)) return res.status(400).send({status:false,message:"plese Provide url"});
    if(typeof longUrl!="string") return res.status(400).send({status:false,message:"plese Provide url in string"});

    if (!validator( longUrl)) return res.status(400).send({status:false,message:"plese Provide valid url"});
    let alreadyUrl= await urlModel.findOne({longUrl:longUrl})
    if(alreadyUrl) return  res.status(400).send({status:false,message:"Url already exist"});

     let short=shortId.generate(longUrl)
     data.shortUrl="http://localhost:3000/"+`${short}`
      data.urlCode=short

   let savedata=await urlModel.create(data) 
   let final= {longUrl:savedata.longUrl,shortUrl:savedata.shortUrl, urlCode:savedata.urlCode} 
   return res.status(201).send({status:true, data:final});
   // console.log(short)
  }catch(error){
   return res.status(500).send({status:false,message:error.message});

   }
};

const getUrl= async function(req,res){
    try{
   let code=req.params.urlCode

   let checkUrl=await urlModel.findOne({urlCode:code}).select({longUrl:1,_id:0})
   if(!checkUrl) return res.status(404).send({status:false , message:"Url Not found"})
   
   return  res.status(302).redirect(checkUrl.longUrl)

  
    }catch(error){
        return res.status(500).send({status:false,message:error.message});  
    }
}



module.exports={shortUrl,getUrl}