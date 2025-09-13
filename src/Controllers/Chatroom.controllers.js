import Chatroom from "../collections/Chatroom.model.js";
import Message from "../collections/Message.model.js";
import { geminiQueue , geminiWorker } from "../queue.js";
import client from "../Caching/redisclient.js";

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
            name : name.trim(),
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

// get all chatrooms controller

const getchatrooms = async (req, res) => {
    try {
        const user = req.user;
        const cacheKey = `user:${user._id}:chatrooms`;
        
        // Try to get from cache first
        try {
            const cachedChatrooms = await client.get(cacheKey);
            if (cachedChatrooms) {
                return res.status(200).json({
                    chatrooms: JSON.parse(cachedChatrooms),
                    message: "Chatrooms fetched from cache"
                });
            }
        } catch (cacheError) {
            console.log("Cache error, fetching from DB:", cacheError.message);
        }
        
        // Fetch from database
        const chatrooms = await Chatroom.find({ user: user._id })
            .sort({ lastActivity: -1 })
            .select('-__v');
        
        // Cache for 5 minutes
        try {
            await client.setEx(cacheKey, 300, JSON.stringify(chatrooms));
        } catch (cacheError) {
            console.log("Error caching chatrooms:", cacheError.message);
        }
        
        res.status(200).json({
            chatrooms,
            message: "Chatrooms fetched successfully from DB"
        });
        
    } catch (error) {
        console.error("Error fetching chatrooms:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
// Get all data of chatroom
const getchatroomdata = async (req , res) => {
    try {
        const { chatroomID } = req.params
    if(!chatroomID){
        return res.status(400).json({message : "chatroomID is required"})
    }
    const chatroom = await Chatroom.findById(chatroomID);
    if(!chatroom){
        return res.status(404).json({message : "Chatroom not found"})
    }
     const messages  = await Message.find({chatroom : chatroomID}).sort({createdAt : -1})
    if(!messages || messages.length === 0){
        return res.status(404).json({message : "No messages found in this chatroom"})
    }
    return res.status(200).json({
        chatroom : {
            _id : chatroom._id,
            name : chatroom.name
        },
        messages
    })
} catch (error) {
    console.error("Error in getchatroomdata controller" , error)
    return res.status(500).json({message : "Internal Server Error"})
    }
}
export {
    createchatroom,
    getchatrooms,
    getchatroomdata
}