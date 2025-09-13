import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const client = createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
})

client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

client.on("connect", () => {
  console.log("Connected to Redis");
});


export default client;