import { verify } from "@/app/lib/jwtUtil";
import { redis } from "@/app/lib/redis";
import { getUserByUUID } from "@/app/lib/user";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const exist = await redis.exists(`betting`);
    if (!exist) {
        return NextResponse.json({
            ok: false,
        });
    }
    const betting = await redis.hGetAll(`betting`);
    return NextResponse.json({
        ok: true,
        bet: { ...betting },
    });
}

export async function POST(req: NextRequest) {
    const token = req.headers.get(`Authorization`)!.split(" ")[1];
    const valid = verify(token);
    if (!valid.ok) {
        return NextResponse.json(
            {
                message: "Unauthorized",
            },
            {
                status: 403,
            }
        );
    }
    const user = await getUserByUUID(valid.payload!.uuid);
    if ((user?.role ?? 0) < 1) {
        return NextResponse.json(
            {
                message: "Unauthorized",
            },
            {
                status: 403,
            }
        );
    }
    const body = await req.json();
    await redis.hSet(`betting`, {
        game: body.game,
        team1: body.team1,
        team2: body.team2,
        start: body.start,
        end: moment(body.start).add(10, "s").format("YYYY-MM-DD HH:mm:ss"),
    });
    return NextResponse.json({
        message: "success",
    });
}
