import Chatroom from "../collections/Chatroom.model.js";
import Message from "../collections/Message.model.js";
import { geminiQueue , queueEvents } from "../queue.js";
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
            .select('-__v -messagecount');
        
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

// Get all data of specific chatroom 
const getchatroomdata = async (req , res) => {
    try {
        // console.log("query params:", req.params);
        const  chatroomID  = req.params.Id
    if(!chatroomID){
        return res.status(400).json({message : "chatroomID is required"})
    }
    const chatroom = await Chatroom.findById(chatroomID);
    if(!chatroom){
        return res.status(404).json({message : "Chatroom not found"})
    }
     const messages  = await Message.find({chatroom : chatroomID}).sort({createdAt : -1})
    if(!messages || messages.length === 0){
        return res.status(200).json([])
    }
    return res.status(200).json({
        chatroom : {
            _id : chatroom._id,
            name : chatroom.name,
            messagecount : messages.length
        },
        messages
    })
} catch (error) {
    console.error("Error in getchatroomdata controller" , error)
    return res.status(500).json({message : "Internal Server Error"})
    }
}

// post message controller

const postmessage = async (req , res) => {
try {
    console.log("params:", req.params);
    const chatroomID = req.params.id;
    const user = req.user;
    const {content} = req.body;
    console.log("chatroomID:", chatroomID);

    if (!content || content.trim() === "") {
    return res.status(400).json({ message: "Message content is required" });
    }

    const newusermessage = new Message({
        chatroom : chatroomID,
        user : user._id,
        role : "user",
        content : content.trim()
    })
    await newusermessage.save();
    
    if(!newusermessage){
        return res.status(500).json({message : "Message not sent"})
    }
    const Allmessage = await Message.find({chatroom : chatroomID}).sort({createdAt : -1});

    await Chatroom.findByIdAndUpdate(chatroomID , {
        lastActivity : Date.now(),
        messagecount : Allmessage.length + 1
    })
    const chatroom = await Chatroom.findById(chatroomID);
       if(!chatroom){
        return res.status(404).json({message : "Chattroom not found"})
    }
     // Checking Queue is ready or not 
     if(!geminiQueue){
       throw new Error("Gemini queue is not initialized");
        }
     


    // Add job to geminiQueue
   const job = await geminiQueue.add("processMessage", {
       chatroomID: chatroomID,
       content: content.trim()
   },
   {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            }
        }
);
console.log(`Added job ${job.id} to Gemini queue, waiting for completion...`);
// Wait for the job to complete (up to 30 seconds)
const result = await job.waitUntilFinished(queueEvents, 30000);

   return res.status(200).json({
    chatroom,
    newusermessage,
    Geminiresponse: result,
    message : "Message sent successfully"
   })




} catch (error) {
     console.error("Error in postmessage controller", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export {
    createchatroom,
    getchatrooms,
    getchatroomdata,
    postmessage
}