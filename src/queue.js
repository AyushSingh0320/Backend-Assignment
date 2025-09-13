import getAIresponse from "./gemini.js";
import { Queue , tryCatch, Worker} from "bullmq";
import Message from "./collections/Message.model.js";


const geminiQueue = new Queue("geminiQueue" , {
    connection : {
        host : process.env.REDIS_HOST  || "localhost",
        port : process.env.REDIS_PORT || 6379,
        password : process.env.REDIS_PASSWORD || ""
    }
});

const geminiWorker = new Worker("geminiQueue" , async (job) => {
    try {
        const {chatroomID, content} = job.data;
        const Airesponse = await getAIresponse(content)

         await Message.create({
            chatroom : chatroomID,
            user : null,
            role : "gemini",
            content : Airesponse,

        })

        return Airesponse;
    } catch (error) {
        console.error("Error processing job in geminiQueue" , error)
    }
},
{
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
    },
    concurrency: 5, // Process up to 5 jobs concurrently
});

export {
    geminiQueue,
    geminiWorker
}