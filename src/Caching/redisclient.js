import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

let redisConfig;

if (process.env.REDIS_URL) {
    // Use REDIS_URL if provided (Render format)
    redisConfig = {
        url: process.env.REDIS_URL
    };
} else {
    // Fallback to individual environment variables
    redisConfig = {
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
       password: process.env.REDIS_PASSWORD || undefined,
    };
}

const client = createClient(redisConfig);

// Add error handling
client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

client.on('connect', () => {
    console.log('Redis Client Connected');
});



export default client;