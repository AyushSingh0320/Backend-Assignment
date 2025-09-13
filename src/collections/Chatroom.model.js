import mongoose from "mongoose";

const Chatroomschema = new mongoose.Schema(
{
   user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
    required : true
   },
   name : {
    type : String,  
    required : true,
    unique : true,
    trim : true
   },
   lastactivity : {
    type : Date,
    default : Date.now
   },
   messagecount : {
    type : Number,
    default : 0
   }
} , 
{ 
    timestamps : true 
});

const Chatroom = mongoose.model("Chatroom" , Chatroomschema);
export default Chatroom;