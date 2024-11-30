const express = require('express')

const app = express()
require("dotenv").config()
const path = require("path")
const hbs = require("hbs")
const mongoose = require("mongoose")
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT
const DBURL = process.env.DBURL

const viewPath = path.join(__dirname,'../templates/views')
const partialPath = path.join(__dirname,"../templates/partials")
const publicPath = path.join(__dirname,"../public")


app.set("view engine","hbs")
app.set("views",viewPath)
app.use(express.static(publicPath))

app.use(cookieParser())

mongoose.connect(DBURL).then(()=>{
        console.log("Database Connected Successfully")
    }

).catch(err=>{
    console.log(err)
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use("/",require("../router/userrouter"))


app.listen(PORT,()=>{
    console.log(`Server is running on  ${PORT}`)
})