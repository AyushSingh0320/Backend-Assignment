import Chatroom from "../collections/Chatroom.model.js";
import Message from "../collections/Message.model.js";

// Create chatroom controller

const createchatroom = async (req , res) => {
    try {
        const user = req.user;
        const {name} = req.body;
        if(!name || name.trim() === ""){
            return res.status(404).json({message : "chatroom name is required"});
        }  
        const existingchatroom = await Chatroom.findOne({name});
        if(existingchatroom){
            return res.status(400).json({message : "Chatroom with this name already exists"});
        }

        const newchatroom = new Chatroom({
            user : user._id,
            name : name.trim()
        })

        await newchatroom.save();

        if(!newchatroom){
            return res.status(500).json({message : "Chatroom not created"});
        }
       return res.status(200).json({
        newchatroom,
        message : "Chatroom created successfully"
       })

    } catch (error) {
        console.error("Error in create chatroom controller" , error)
        return res.status(500).json({
            message : "Internal Server Error"
        })
        
    }
}

export const createchatroom1 = async (req, res) => {
    try {
        console.log("Chatroom creation endpoint hit!");
        console.log("Request body:", req.body);
        
        res.status(200).json({
            message: "Chatroom endpoint is working!",
            body: req.body
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export {
    createchatroom,
}