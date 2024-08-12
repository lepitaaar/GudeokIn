// import { NextRequest } from "next/server";
// import jwt from "jsonwebtoken";
// import secret from "@/app/export/DTO";

import { User } from "@/app/export/DTO";
import { db } from "@/app/lib/database";
import {
    refreshVerify,
    verify,
    decode,
    sign,
    refresh,
} from "@/app/lib/jwtUtil";
import { getUserByUUID } from "@/app/lib/user";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
    refreshToken: z.string(),
});

export async function POST(req: NextRequest) {
    const token = req.headers.get("Authorization")!.split(" ")[1];
    const payload = verify(token);

    if (payload.ok || payload.message != "jwt expired") {
        console.log("not expire");
        return NextResponse.json(
            {
                message: "Access Token is not expired!",
            },
            {
                status: 500,
            }
        );
    }

    const valid = schema.safeParse({
        ...(await req.json()),
    });

    if (valid.error) {
        return NextResponse.json(
            {
                message: "Params Validation error",
            },
            {
                status: 500,
            }
        );
    }

    const refreshToken = valid.data.refreshToken;
    const decode_payload = decode(token);

    if (!decode_payload.ok) {
        return NextResponse.json(
            {
                message: "Internal Server Error",
            },
            {
                status: 500,
            }
        );
    }

    const rfTokenRes = await db.query(
        `SELECT refreshToken as rf FROM everytime.users WHERE uuid = @user_uuid`,
        {
            user_uuid: decode_payload.payload?.uuid,
        }
    );
    const rfToken = rfTokenRes.recordset[0].rf;
    if (rfToken == undefined || rfToken != refreshToken) {
        //after move rfToken to redis
        return NextResponse.json(
            {
                message: "Token Mismatching",
            },
            {
                status: 500,
            }
        );
    }

    const validToken = refreshVerify(refreshToken);
    if (!validToken.ok) {
        await db.query(
            `UPDATE everytime.users SET refreshToken = NULL where uuid = @user_uuid`,
            {
                user_uuid: decode_payload.payload?.uuid,
            }
        );
        return NextResponse.json(
            {
                message: "jwt expired",
            },
            {
                status: 401,
            }
        );
    }

    const user: User | undefined = await getUserByUUID(
        decode_payload.payload!.uuid
    );

    if (!user) {
        return NextResponse.json(
            {
                message: "유저를 찾지 못하였습니다",
            },
            {
                status: 403,
            }
        );
    }

    const r_acToken = sign(user);
    const r_rfToken = refresh();

    await db.query(
        `UPDATE everytime.users SET refreshToken = @rf WHERE uuid = @user_uuid`,
        {
            rf: r_rfToken,
            user_uuid: decode_payload.payload!.uuid,
        }
    );

    return NextResponse.json(
        {
            message: "success",
            accessToken: r_acToken,
            refreshToken: r_rfToken,
        },
        {
            status: 200,
        }
    );
}
