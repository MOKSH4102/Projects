const express = require('express');
const router = express.Router();
const User = require('../model/users')
const bcrypt  = require('bcryptjs')
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const multer = require('multer')
const fs = require('fs');



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now() + ".jpg");
  }
});

const upload = multer(
  { storage: storage }
);
router.get('/', (req, res) => {
  res.render("index")
});

router.post('/reg',upload.single("file"), async (req, res) => {
  try {
    id = req.body.id

    if(id){
      const dt = await User.findByIdAndUpdate(id,{name:req.body.name,email:req.body.email,password:req.body.password,phone:req.body.phone,image:req.file.filename})
      fs.unlinkSync(`./public/uploads/${dt.image}`)
      res.render("index",{"msg": "updation successfully"})
    }
    else{
    const user = new User({name:req.body.name,email:req.body.email,password:req.body.password,phone:req.body.phone,image:req.file.filename});
    await user.save();
    res.render("index",{"msg": "registration successfully"});
  }
 }
 catch (error) {
    console.log(error);
    res.render("index",{"err":"Something Went Wrong"});
  }
});

router.get("/home",auth,async(req,resp)=>{
  try {
      const users = await User.find()
      resp.render("home",{"data":users})
  } catch (error) {
      
  }
})

router.get("/delete",auth,async(req,resp)=>{
  const id = req.query.id;
  try {
    const dt = await User.findByIdAndDelete(id)
    fs.unlinkSync(`./public/uploads/${dt.image}`)
    resp.redirect("/home")
  } catch (error) {
    console.log(error);
    
  }
  
  
})

router.get("/update",auth,async(req,resp)=>{
  const id = req.query.id;
  try {
    const dt = await User.findById(id)
    resp.render("index",{"data":dt})
  } catch (error) {
    console.log(error);
    
  }
})

router.get("/login",async(req,resp)=>{
  resp.render("login")
})

router.post("/userlogin",async(req,resp)=>{
  
  
      try {
        const user = await User.findOne({email:req.body.email})

        if(user.Tokens.length>=3)
          {
              resp.render("login",{"err":"Max user limit reached !!!!"})
              return;
          }
        
        if(user){
          isvalid = await bcrypt.compare(req.body.password,user.password)
          if(isvalid){
            // const token = await jwt.sign({_id:user._id},process.env.S_KEY)
            const token = await user.generateToken()
            
            
            resp.cookie("token",token)
            resp.redirect("home")
          }
          else{
            resp.render("login",{"err":"Invalid email or Password"})
          }
        }
        else{
          resp.render("login",{"err":"Invalid email or Password"})
        }
      } catch (error) {
        console.log(error);
        resp.render("login",{"err":"something went wrong"})
      }
    })
  
    router.get("/logout",auth,(req,resp)=>{
      const user = req.user
      const token = req.token
  
      
      user.Tokens =  user.Tokens.filter(ele=>{
          return ele.token != token
      })
      user.save()
      resp.clearCookie("token")
      resp.render("login")
    })

    router.get("/logoutall",auth,(req,resp)=>{

      const user = req.user
      const token = req.token
  
      
      user.Tokens =  [];
      user.save()
      resp.clearCookie("token")
      resp.render("login")
  })

module.exports = router