import { Router } from "express";
import Auth from "../Middleware/Auth.middleware.js";
import {createCheckoutSession} from "../Controllers/Subscription.controllers.js";



const router = Router();


router.route("/pro").post(Auth , createCheckoutSession);



export default router;