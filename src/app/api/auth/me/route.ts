import { verify } from "@/app/lib/jwtUtil";
import { redis } from "@/app/lib/redis";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const header = headers();
    const token = header.get("Authorization")?.split(" ")[1];

    const verified = await verify(token ?? "");
    if (verified.ok) {
        const uuid = verified.payload!.uuid;
        const fcm = (await req.json()).fcm;
        if (fcm) {
            console.log(`update FCM TOKEN ${uuid}, ${fcm}`);
            await redis.sAdd(`fcm:${uuid}`, fcm);
        }
        return NextResponse.json(
            {
                message: "verify success",
            },
            {
                status: 200,
            }
        );
    }
    return NextResponse.json(
        {
            message: "failed verify",
        },
        {
            status: 500,
        }
    );
}
