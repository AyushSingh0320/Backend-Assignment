import User from "../collections/User.model.js";
import jwt from "jsonwebtoken";
import client from "../Caching/redisclient.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config({path : "./.env"})

// Signup controller

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

// Send OTP controller

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
};
// Verify OTP controller

const verifyotp = async (req , res) => {
    try {
        const {phoneNo , otp} = req.body;
        if(!phoneNo || phoneNo.length !== 10){
            return res.status(400).json({message : "Valid phone number is required"})
        }
        if(!otp || otp.length !== 4){
            return res.status(400).json({message : "valid otp is required"})    
        }

        const storedOtp = await client.get(phoneNo);
        if(!storedOtp){
            return res.status(400).json({message : "OTP expired or not sent"})
        }

        if(storedOtp !== otp){
            return res.status(400).json({message : "Invalid OTP"})
        }
        
        const user = await User.findOne({phoneNo});
        if(!user){
            return res.status(404).json({message : "User not found"})
        }

        const token = jwt.sign(
            {userId : user._id} ,
            process.env.JWT_SECRET ,
            {expiresIn : "24h"}
        )

        await client.del(`otp:${phoneNo}`);
        return res.status(200).json({
        token ,
        user : {
            id : user._id,
            name : user.name,
            phoneNo : user.phoneNo
        },
        message : "OTP verified successfully"
    })

    } catch (error) {
        console.error("Error in verifyotp controller", error)
        return res.status(500).json({message : "Internal Server Error"})
    }
}; 
// Forgot Password controller

const forgotpassword = async (req , res) => {
    try {
        const {phoneNo} = req.body;
        if(!phoneNo || phoneNo.length !== 10){
            return res.status(400).json({message : "valid phone number is required"})
        }
      const otp = crypto.randomInt(1000, 9999).toString();
        console.log("Generated OTP: ", otp);

        return res.status(200).json({otp , message : "OTP for password reset sent successfully"})

    } catch (error) {
        console.error("Error in forgotpassword controller", error)
        return res.status(500).json({message : "Internal Server Error"})    
    }
}
// Change Password controller
const changepassword = async (req , res) => {
    try {
        const {oldpassword , newpassword} = req.body;

        if(oldpassword === newpassword){
            return res.status(400).json({message : "New password must be different from old password"})
       }
        if(!oldpassword || !newpassword){
            return res.status(400).json({message : "Both old and new passwords are required"})
        }

        const phone = req.user.phoneNo
        console.log("User phone number: ", phone);
        const user = await User.findById(req.user._id)
        console.log("User details: ", user);

       if(!user){
      return res.status(404).json({message : "User not found"})
      }
 
   const ispasswordcorect = await user.ispasswordcorect(oldpassword)
   if(!ispasswordcorect){
    return res.status(400).json({message : "Old password is incorrect"})
   }

      user.password = newpassword
      await user.save({validateBeforeSave : false})

  return res.status(200)
            .json({message : "Password changed successfully"})

}
     catch (error) {
        console.error("Error in change password controller", error)
        return res.status(500).json({message : "Internal Server Error"})
    }
}

// User details controller

const userdetails = async (req , res) => {
    try {
        const user = req.user;
        return res.status(200).json({user : {
            id : user._id,
            name : user.name,
            phoneNo : user.phoneNo
        }})
    } catch (error) {
        console.error("Error in userdetails controller", error)
        return res.status(500).json({message : "Internal Server Error"})
    }
}

export {
    signup ,
    sendotp,
    verifyotp,
    forgotpassword,
    changepassword,
    userdetails
}