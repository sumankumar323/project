const express=require("express");
const router=express()


//router.post("/url/shorten",)
//router.get("/:urlCode")
router.get("/textcase",function(a,b){
  b.send("abc")
});

module.exports=router