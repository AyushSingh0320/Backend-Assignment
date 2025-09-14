import { Router } from "express";
import Auth from "../Middleware/Auth.middleware.js";
import {createCheckoutSession , subscriptionstatus} from "../Controllers/Subscription.controllers.js";



const router = Router();

// Create Checkout Session route
router.route("/pro").post(Auth , createCheckoutSession);

// Get Subscription Status route
router.route("/status").get(Auth, subscriptionstatus);

export default router;