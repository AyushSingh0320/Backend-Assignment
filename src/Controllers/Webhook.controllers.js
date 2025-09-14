import User from "../collections/User.model.js";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config({path : "./.env"})

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// webhook  controller

const stripwebhook = async (req , res) => {
    try {
        const sig = req.headers["stripe-signature"];
        console.log("sig" , sig);

    let event;
 console.log("Req body" , req.body);       
    try {
      //  Verify event using webhook secret
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(" Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
console.log("Event" , event);
    //  Handle event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata.userId;
          if (!userId) {
            console.error("No userId found in session metadata");
                    break;
                }

          // Upgrade user to Pro
           const user = await User.findByIdAndUpdate(
                    userId,
                    { 
                        currentmodel: "Pro",
                    },
                    { new: true }
                );

                if (user) {
                    console.log(`Subscription activated for user ${userId}`);
                } else {
                    console.error(`User ${userId} not found`);
                }
                break;
         

          console.log(` Subscription activated for ${userId}`);
          break;
        }

        case "invoice.payment_failed": {
          const session = event.data.object;
          const userId = session.metadata.userId;

          // Downgrade user back to Basic
         const user = await User.findOneAndUpdate(
                    { stripeCustomerId: customerId },
                    {
                        currentmodel: "Basic",
                    },
                    { new: true }
                );

                if (user) {
                    console.log(`Payment failed for user ${user._id}`);
                }
                break;

          console.log(` Subscription downgraded for ${userId}`);
          break;
        }

        default:
          console.log(` Unhandled event type ${event.type}`);
      }

      res.status(200).json({ received: true });
    } 
     catch (error) {
        console.error("Error in stripe webhook", error);
        res.status(500).json({ error: "Internal Server Error" });
     }};

     
export default stripwebhook;