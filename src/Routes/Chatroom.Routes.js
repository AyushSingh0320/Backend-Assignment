import express from 'express';
import { Router } from "express";
import Auth from "../Middleware/Auth.middleware.js";
import modelcheck from '../Middleware/modelcheck.middleware.js';
import {createchatroom , getchatrooms, getchatroomdata , postmessage} from "../Controllers/Chatroom.controllers.js";
const router = Router();

// Create Chatroom route 
router.route("/").post(Auth , createchatroom);

// Get Chatrooms route
router.route("/").get(Auth , getchatrooms);

// Get Chatroom data route
router.route("/:Id").get(Auth , getchatroomdata);

// Post Message route
router.route("/:id/messages").post(Auth , modelcheck , postmessage);

export default router;