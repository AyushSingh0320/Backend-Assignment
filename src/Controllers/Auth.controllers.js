import User from "../collections/User.model.js";
import jwt from "jsonwebtoken";
import client from "../Caching/client.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config({path : "./.env"})


const signup = async (req , res) => {
    try {
        const {name , phoneNo , password} = req.body;

        if (!name || !phoneNo || !password){
            return res.status(400).json({message : "All fields are required"})
        }
        if(phoneNo.length !== 10){
            return res.status(400).json({message : "Phone number must be 10 digits long"})
        }

        const existinguser = await User.findOne({phoneNo})
        if(existinguser){
            return res.status(404).json({message : "User already exists"})
        }
         const newuser = new User(
            {
                name : name,
                phoneNo : phoneNo,
                password : password 
            }
         )
          await newuser.save();
          const newuserexistance = await User.findById(newuser._id);
          if(!newuserexistance){
            return res.status(500).json({message : "User not saved in database"})
          }
        return res.status(200).json({
            newuser : {
                id : newuser._id,
                name : newuser.name,
                phoneNo : newuser.phoneNo
            },
            message : "User registered successfully"
        })
    
    } catch (error) {
        console.error("Error in signup controller" , error)
        return res.status(500).json({message : "Internal Server Error"}) 
    }
};

const sendotp = async (req , res) => {
    try {
        const {phoneNo} = req.body;
        if(!phoneNo || phoneNo.length !== 10){
            return res.status(400).json({message : "Valid phone number is required"})
        }
        const otp = crypto.randomInt(1000, 9999).toString();
        console.log("Generated OTP: ", otp);

        // store otp in redis
        await client.setEx(phoneNo , 300 , otp)

        return res.status(200).json({otp , message : "OTP sent successfully"})

    } catch (error) {
        console.error("Error in sendotp controller", error)
        return res.status(500).json({message : "Internal Server Error"})
    }
}


export {
    signup ,
    sendotp
}