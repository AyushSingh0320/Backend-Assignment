import express from 'express';
import { Router } from "express";
import Auth from "../Middleware/Auth.middleware.js";
import {createchatroom} from "../Controllers/Chatroom.controllers.js";
const router = Router();

// Create Chatroom route 

router.route("/create").post(Auth , createchatroom);

export default router;