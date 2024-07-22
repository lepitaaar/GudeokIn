import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTpayload, User, secret } from "@/app/export/DTO";
import { db } from "@/app/lib/database";
import { makePasswordHash } from "@/app/lib/authUtil";
import { refresh, sign } from "@/app/lib/jwtUtil";

interface SetupRequest {
    id: string;
    password: string;
    nickname: string;
}

export async function POST(req: NextRequest) {
    /**
     * const body: SetupRequest = await req.json();

    if (req.headers.get("Authorization") == undefined) {
        return NextResponse.json(
            { message: "로그인이 필요합니다" },
            { status: 401 }
        );
    }

    //check body null

    const token = req.headers.get("Authorization")!.split(" ")[1];
    const payload = jwt.verify(token, secret) as JWTpayload;

    const data = await db.query(
        `select username,uuid,refreshToken,setup from everytime.users where uuid = @uuid`,
        {
            uuid: payload.uuid,
        }
    );
    const user: User = JSON.parse(JSON.stringify(data))["recordset"][0];

    if (user.setup) {
        return NextResponse.json(
            {
                message: "이미 설정이 완료되었습니다",
            },
            {
                status: 401,
            }
        );
    }

    const hashedPassword = await makePasswordHash(user.username, body.password);

    db.query(
        `update everytime.users set username=@username,password=@pw,nickname=@nickname,setup=@setup where uuid = @uuid`,
        {
            username: body.id,
            pw: hashedPassword,
            nickname: body.nickname,
            uuid: payload.uuid,
            setup: true,
        }
    );

    const refreshToken = user.refreshToken ?? refresh();
    const accessToken = sign(user);

    if (user.refreshToken == undefined) {
        await db.query(
            `update everytime.users set refreshToken = @token where uuid = @uuid`,
            {
                token: refreshToken,
                uuid: user.uuid,
            }
        );
    }

    return NextResponse.json(
        {
            message: "설정이 완료되었습니다",
            accessToken: accessToken,
            refreshToken: refreshToken,
        },
        {
            status: 200,
        }
    );
     */
}
