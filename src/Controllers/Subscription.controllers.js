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




export {
    createCheckoutSession
}   
