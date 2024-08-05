import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/app/lib/database";
import { makePasswordHash } from "@/app/lib/authUtil";
import { refresh, sign } from "@/app/lib/jwtUtil";
import { getUserByUUID } from "@/app/lib/user";
import { redis } from "@/app/lib/redis";

// Define the schema for the request parameters
const loginSchema = z.object({
    id: z.string().min(1, { message: "ID는 필수 항목입니다." }),
    pw: z.string().min(1, { message: "비밀번호는 필수 항목입니다." }),
    fcm: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
    try {
        const params = request.nextUrl.searchParams;

        // Parse and validate the request parameters
        const parseResult = loginSchema.safeParse({
            id: params.get("id"),
            pw: params.get("pw"),
            fcm: params.get("fcm") ?? null,
        });

        // If the validation fails, return a 400 response with the validation errors
        if (!parseResult.success) {
            return NextResponse.json(
                {
                    message: "값이 비어있습니다.",
                    errors: parseResult.error.errors,
                },
                {
                    status: 400,
                }
            );
        }

        const { id, pw, fcm } = parseResult.data;
        const ip =
            request.headers.get("X-Real-IP") ??
            request.headers.get("X-Forwarded-For") ??
            "127.0.0.1";
        console.log(`${ip} request login api . ${id}`);

        const existUser = await db.query(
            `select username, uuid, refreshToken, password from everytime.users where username = @id`,
            {
                id: id,
            }
        );

        if (existUser.recordset.length === 0) {
            return NextResponse.json(
                {
                    message: "로그인 정보가 일치하지 않습니다.",
                },
                {
                    status: 403,
                }
            );
        }

        const hashedPw = await makePasswordHash(id, pw);
        if (hashedPw !== existUser.recordset[0].password) {
            return NextResponse.json(
                {
                    message: "로그인 정보가 일치하지 않습니다.",
                },
                {
                    status: 403,
                }
            );
        }

        const user = existUser.recordset[0];

        const refreshToken = user.refreshToken ?? refresh();
        const user_data = await getUserByUUID(user.uuid);
        if (!user_data) {
            // Login failed
            return NextResponse.json(
                {
                    message: "로그인 정보가 일치하지 않습니다.",
                },
                {
                    status: 401,
                }
            );
        }

        const accessToken = sign(user_data);

        if (user.refreshToken == undefined) {
            await db.query(
                `update everytime.users set refreshToken = @token where uuid = @uuid`,
                {
                    token: refreshToken,
                    uuid: user.uuid,
                }
            );
        }

        if (fcm) {
            await redis.hSet("fcm", user.uuid, fcm);
        }

        return NextResponse.json(
            {
                message: "로그인 성공",
                accessToken: accessToken,
                refreshToken: refreshToken,
            },
            {
                status: 200,
            }
        );
    } catch (e) {
        console.log(e);

        return NextResponse.json({
            status: 500,
            message: "Internal Server Error",
        });
    }
}
