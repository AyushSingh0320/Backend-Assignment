import { Router } from "express";
import stripwebhook from "../Controllers/Webhook.controllers.js";
import express from "express";

const router = Router();

router.route("/stripe").post(express.raw({ type: "application/json" }), stripwebhook);

export default router;  