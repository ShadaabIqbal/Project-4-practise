const express = require("express")
const router = express.Router()
const { createUrl,getUrl }= require("../controller/urlController")
 
//===================create api===============================>>>>>
router.post("/url/shorten",createUrl);

//===================get api===================================>>>>>
router.get("/:urlCode",getUrl);

//===================if url is wrong===========================>>>>>
router.all('/*', function(req,res){
    res.status(400).send({status: false, message: 'Path not found'})
})

module.exports = router