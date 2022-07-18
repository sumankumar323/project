const express=require("express");
const router=express()
const {shortUrl,getUrl}=require("../controller/urlController")


router.post("/url/shorten",shortUrl)
router.get("/:urlCode",getUrl)
router.get("/textcase",function(a,b){
  b.send("abc")
});

module.exports=router