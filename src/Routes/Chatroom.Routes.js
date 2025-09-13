import express from 'express';
import { Router } from "express";
import Auth from "../Middleware/Auth.middleware.js";
import {createchatroom , getchatrooms, getchatroomdata} from "../Controllers/Chatroom.controllers.js";
const router = Router();

// Create Chatroom route 
router.route("/").post(Auth , createchatroom);

// Get Chatrooms route
router.route("/").get(Auth , getchatrooms);

// Get Chatroom data route
router.route("/:Id").get(Auth , getchatroomdata);
export default router;