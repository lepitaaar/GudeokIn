import { createClient } from "redis";

const url = process.env.REDIS_HOST;

const client = createClient({
    url,
});
client.on("connect", () => {
    console.log("레디스 서버 연결");
});
client.on("error", function (error) {
    console.error(error);
});
export const redis = await client.connect();
