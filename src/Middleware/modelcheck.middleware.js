import User from "../collections/User.model.js";
import message from "../collections/Message.model.js";


const modelcheck = async (req , res , next) => {
    try {
        const userId = req.user.id;
        if(!userId){
            return res.status(400).json({message : "User ID is required"})
        }

        const user = await  User.findById(userId);
        if(!user){
            return res.status(404).json({message : "User not found"})
        }

        const currentmodel = user.currentmodel;
        if(!currentmodel){
            return res.status(400).json({message : "User model not found"})
        }

        if(currentmodel === "Pro"){
            return next();
        }
       
        const twentyfourhourago = new Date(Date.now() - 24*60*60*1000);
        console.log("24 hours ago:", twentyfourhourago);

        const messagecount = await message.countDocuments({
            user : userId,
            role : "user",
            createdAt : {$gte : twentyfourhourago}
        })

        console.log("Message count in last 24 hours:", messagecount);

        if(messagecount >= 5){
            return res.status(403).json({message : "Free plan limit reached. Upgrade to Pro for unlimited access."})
        }

        next();


    } catch (error) {
        console.error("Error in modelcheck middleware:", error);
        return res.status(500).json({message : "Internal server error"});
    }
}

export default modelcheck;
