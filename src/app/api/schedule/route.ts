import { db } from "@/app/lib/database";
import { verify } from "@/app/lib/jwtUtil";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const token = req.headers.get("Authorization")!.split(" ")[1];

    const user = verify(token);

    if (!user.ok) {
        return NextResponse.json(
            {
                message: "Unauthorized",
            },
            {
                status: 403,
            }
        );
    }

    await db.query(`DELETE FROM everytime.schedule WHERE uuid = @uuid`, {
        uuid: user.payload?.uuid,
    });

    await db.query(
        `INSERT INTO everytime.schedule (uuid, map) VALUES (@uuid, @map)`,
        {
            uuid: user.payload?.uuid,
            map: body["mapping"],
        }
    );

    return NextResponse.json(
        {
            message: "success",
        },
        {
            status: 200,
        }
    );
}
