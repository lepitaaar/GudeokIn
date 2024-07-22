import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/database";
import { makePasswordHash } from "@/app/lib/authUtil";
import { refresh, sign } from "@/app/lib/jwtUtil";
import { User } from "@/app/export/DTO";
import { getUserByUUID } from "@/app/lib/user";

function isNullOrWhitespace(input: String) {
    return input == null || input.toString().trim() == "";
}

export async function POST(request: NextRequest) {
    try {
        const params = request.nextUrl.searchParams;
        //console.log(params)
        const id = params.get("id") ?? "";
        const pw = params.get("pw") ?? "";
        const ip =
            request.headers.get("X-Real-IP") ??
            request.headers.get("X-Forwarded-For") ??
            "127.0.0.1";
        console.log(`${ip} request login api . ${id}`);

        if (isNullOrWhitespace(id) || isNullOrWhitespace(pw)) {
            return NextResponse.json(
                {
                    message: "값이 비어있습니다.",
                },
                {
                    status: 500,
                }
            );
        }
        const existUser = await db.query(
            `select username,uuid,refreshToken,password from everytime.users where username = @id`,
            {
                id: id,
            }
        );
        const hashedPw = await makePasswordHash(id, pw);
        if (
            existUser.recordset.length == 0 ||
            hashedPw !== existUser.recordset[0].password
        ) {
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

        //check Valid User
        /**
         * if (user == undefined) {
            //login failed
            return NextResponse.json(
                {
                    message: "로그인 정보가 일치하지 않습니다.",
                },
                {
                    status: 401,
                }
            );
        }
         */

        const refreshToken = user.refreshToken ?? refresh();
        const user_data = await getUserByUUID(user.uuid);
        if (!user_data) {
            //login failed
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
