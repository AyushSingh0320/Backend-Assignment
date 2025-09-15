import {GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });


  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getAIresponse(prompt) {

const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
const result = await model.generateContent(prompt);
const response = await result.response;
const text = response.text();

return text;
} 

 export default getAIresponse;
