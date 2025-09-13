import express from 'express';
import { Router } from "express";
import Auth from "../Middleware/Auth.middleware.js";
import {createchatroom , getchatrooms } from "../Controllers/Chatroom.controllers.js";
const router = Router();

// Create Chatroom route 
router.route("/").post(Auth , createchatroom);

// Get Chatrooms route
router.route("/").get(Auth , getchatrooms);


export default router;