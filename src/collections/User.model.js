import mongoose from "mongoose";
import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

const userschema = new mongoose.Schema({
    name : {
        type : String,
        required : true ,
        unique : true,
        trim : true

    },
    phoneNo : {
        type : String,
        required : true,
        unique : true,
        trim : true,
    },
    password : {
        type : String,
        required : true,
        unique : true,
        trim : true,
    },
    currentmodel : {
        type : String,
        enum : ["Basic" , "Pro"],
        default : "Baic"
    }
},
{
    timestamps : true
})

// Hashing password before saving to database

userschema.pre("save" , async function(next) {
    if(!this.isModified("password")){
        return next();
    }   
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})
// Method to compare password (optional as we are not building login functionality here)

userschema.methods.ispasswordcorect = async function (password) {
  const passresult = await bcrypt.compare(password , this.password)
  return passresult ;
  }

  
const User = mongoose.model("User" , userschema)

export default User;