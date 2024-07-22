import { createClient } from "redis";

const url = process.env.REDIS_HOST;

const client = createClient({
    url,
});
client.on("connect", () => {
    console.log("REDIS CONNECTED");
});
client.on("error", function (error) {
    console.error(error);
});
export const redis = await client.connect();
