import Stripe from "stripe"
import dotenv from "dotenv"
import User from "../collections/User.model.js"
dotenv.config({path : "./.env"})

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)



// Initiate pro subscription

const createCheckoutSession = async (req ,res) => {
    try {
        const session = await stripeClient.checkout.sessions.create({
            payment_method_types : ['card'],
            mode : 'subscription',
            line_items : [
                {
                    price : "price_1S7DST4DBcGKY7P8dJrMkdhm",
                    quantity : 1
                }
            ],
            metadata: {
            userId: req.user.id,  // ✅ your DB user ID
         },

            success_url : "http://localhost:3000/success",
            cancel_url : "http://localhost:3000/cancel"
        });
        if(!session){
            return res.status(500).json({error : "Unable to create checkout session"})
        }
        console.log("Checkout session created:", session);
        
        return res.status(200).json({url : session.url})
    } catch (error) {
        console.error("Error in createCheckoutSession controller" , error)
        return res.status(500).json({error : error.message})
    }
}

//  get subscription status

const subscriptionstatus = async (req , res) => {
    try {
        const userid = req.user.id;

        if(!userid){
            return res.status(400).json({message : "User ID is required"})
        }   

        const user = await User.findById(userid);
        if(!user){
            return res.status(404).json({message : "User not found"})
        }
        return res.status(200).json({
            user : {
                currentmodel : user.currentmodel,
            }
        })

        
    } catch (error) {
        console.error("Error in subscriptionstatus controller" , error)
        return res.status(500).json({message : "Internal Server Error"})
    }
}




export {
    createCheckoutSession,
    subscriptionstatus
}    