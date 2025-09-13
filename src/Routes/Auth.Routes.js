import express from "express";
import { Router } from "express";
import { signup  , sendotp} from "../Controllers/Auth.controllers.js";
const router = Router();



// Signup Route
router.route("/signup").post(signup);

// Send OTP Route
router.route("/send-otp").post(sendotp);







export default router;