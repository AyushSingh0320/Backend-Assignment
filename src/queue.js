import getAIresponse from "./gemini.js";
import { Queue , Worker , QueueEvents} from "bullmq";
import Message from "./collections/Message.model.js";
import Chatroom from "./collections/Chatroom.model.js";
import dotenv from "dotenv"
dotenv.config({path : "./.env"})


const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
};


const geminiQueue = new Queue("geminiQueue" , {
    connection : redisConnection
    });

    // queueevents
    const queueEvents = new QueueEvents("geminiQueue", {
    connection: redisConnection
});
console.log("queueEvents" , queueEvents)



const geminiWorker = new Worker("geminiQueue" , async (job) => {
      const {chatroomID, content} = job.data;
    try {
       console.log(` Processing job ${job.id} for chatroom ${chatroomID}`);
        const Airesponse = await getAIresponse(content)

         if (!Airesponse) {
            throw new Error("No AI response received");
        }

       const Aimessage =  new Message({
        chatroom : chatroomID,
        user : null,
        role : "gemini",
        content : Airesponse.trim()
       })
       await Aimessage.save();

        // Update chatroom message count
        // const messageCount = await Message.countDocuments({ chatroom: chatroomID });
        // await Chatroom.findByIdAndUpdate(chatroomID, {
        //     lastActivity: new Date(),
        //     messageCount: messageCount
        // });

    return  {
       airespnse:Airesponse.trim()
    }

    } catch (error) {
        console.error("Error processing job in geminiQueue" , error)
        const errorMessage = new Message({
            chatroom: chatroomID,
            user: null,
            content: "Sorry, I encountered an error processing your message. Please try again.",
            role: 'gemini',
        });
        
        await errorMessage.save();
        
        throw error;
    }
},
{
    connection: redisConnection,
    concurrency: 10, // Process up to 10 jobs concurrently
});

// Event listeners for logging

geminiWorker.on('completed', (job, result) => {
    console.log(`✅ Job ${job.id} completed:`, result.airespnse?.substring(0, 100) + "...");
    console.log("result" , result)
});

geminiWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed: ${err.message}`);
});
export {
    geminiQueue,
    geminiWorker,
    queueEvents
}