const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
        
    },
    password: {
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    image:{
        type: String,
        
    },
    Tokens: [
        {
            token:{
                type: String
                
            }
        }
    ]
})

userschema.pre("save", async function() {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10)
    }
})

userschema.methods.generateToken = function(){
    const token = jwt.sign({_id : this._id},process.env.S_KEY)
    this.Tokens = this.Tokens.concat({token:token})
    this.save();
    return token;
} 
const User = mongoose.model('User', userschema)

module.exports = User