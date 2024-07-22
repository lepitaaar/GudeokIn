import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/database";
import { createHashedPassword } from "@/app/lib/authUtil";
import { randomUUID } from "crypto";
import { Schema, number, string, z } from "zod";
import { redis } from "@/app/lib/redis";
import { extractEmailDetails } from "@/app/lib/util";

const schema = z.object({
    id: string()
        .min(5)
        .max(20)
        .regex(/^[a-z0-9]+$/),
    pw: string()
        .min(8)
        .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*()._-]+$/),
    email: string().regex(
        /^[0-9]{4}[1-3][0-9]{1}[0-9]{1}[0-9]{1,2}@gudeok\.hs\.kr$/,
        "Invalid Email"
    ),
    grade: number(),
    class: number(),
    number: number(),
    nickname: string()
        .min(2)
        .max(20)
        .regex(/^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]+$/),
});

export async function POST(request: NextRequest) {
    /* middleware check permission */

    const ip =
        request.headers.get("X-Real-IP") ??
        request.headers.get("X-Forwarded-For") ??
        "127.0.0.1";
    try {
        const valid = schema.safeParse({
            ...(await request.json()),
        });

        if (valid.error) {
            return NextResponse.json(
                {
                    message: "Params Validation Error",
                },
                {
                    status: 500,
                }
            );
        }
        const data = valid.data;

        const detail = extractEmailDetails(data.email);
        if (
            data.grade !== detail?.grade ||
            data.class !== detail?.class ||
            data.number !== detail?.number
        ) {
            return NextResponse.json(
                {
                    message: "Params Validation Error",
                },
                {
                    status: 500,
                }
            );
        }
        console.log(`${ip} request register api . ${data.id}`);

        const isVerified = await redis.get(`verified:${data.email}`);

        if (!isVerified) {
            return NextResponse.json(
                {
                    message: "이메일이 인증되지 않았습니다.",
                },
                {
                    status: 400,
                }
            );
        }

        const { password, salt } = await createHashedPassword(data.pw);

        const exist = await db.query(
            `SELECT * from everytime.users where username = @id`,
            {
                id: data.id,
            }
        );
        if (exist.recordset.length != 0) {
            //check Type
            return NextResponse.json(
                {
                    message: "이미 회원가입 되있습니다.",
                },
                {
                    status: 403,
                }
            );
        }

        const uuid = randomUUID();
        await db.query(
            `INSERT INTO everytime.users (username, password, salt, uuid, refreshToken) VALUES (@id, @pw, @salt, @uuid, NULL);`,
            {
                id: data.id,
                pw: password,
                salt: salt,
                uuid: uuid,
            }
        );

        await db.query(
            `INSERT INTO everytime.user_info (uuid, grade, class, number, role, nickname, profileImage, email) VALUES (@uuid, @grade, @class, @number, @role, @nickname, @profileImage, @email);`,
            {
                uuid: uuid,
                grade: data.grade,
                class: data.class,
                number: data.number,
                role: 0,
                nickname: data.nickname,
                profileImage: "/default-profile.webp",
                email: data.email,
            }
        );

        return NextResponse.json(
            {
                message: "등록되었습니다.",
            },
            {
                status: 200,
            }
        );
    } catch (e) {
        console.log(e);

        return NextResponse.json(
            {
                message: "BAD REQUEST",
            },
            {
                status: 500,
            }
        );
    }
}
