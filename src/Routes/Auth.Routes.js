import express from "express";
import { Router } from "express";
import Auth from "../Middleware/Auth.middleware.js";
import { signup  , sendotp , verifyotp , forgotpassword , changepassword , userdetails} from "../Controllers/Auth.controllers.js";
const router = Router();




// Signup Route
router.route("/signup").post(signup);

// Send OTP Route
router.route("/send-otp").post(sendotp);

// Verify OTP Route
 router.route("/verify-otp").post(verifyotp);

// Forgot Password Route
router.route("/forgot-password").post(forgotpassword);

// Change Password Route
router.route("/change-password").post(Auth , changepassword);

// User Details Route
router.route("/user/me").get(Auth , userdetails);

export default router;