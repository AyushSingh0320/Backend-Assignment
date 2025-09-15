import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const client = createClient({
 url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
password: process.env.REDIS_PASSWORD || undefined,
})


export default client;