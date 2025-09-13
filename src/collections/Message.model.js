import mongoose from "mongoose";

const messageschema = new mongoose.Schema({
   chatroom : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Chatroom",
   },
   user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",  
    required : true
   },
   content : {
    type : String,
    required : true,
    trim : true
   },
   role : {
    type : String,
    enum : ["user" , "gemini"],
    default : "user"
   }
} , { timestamps : true })


const Message = mongoose.model("Message" , messageschema);
export default Message;