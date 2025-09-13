import express from "express";
import { Router } from "express";
import { signup } from "../Controllers/Auth.controllers.js";
const router = Router();



// Signup Route
router.route("/signup").post(signup);







export default router;