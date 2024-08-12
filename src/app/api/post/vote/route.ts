/** gaechu (bool)
 *  beechu (bool)
 *  uuid (string)
 *  post_id (number)
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/app/lib/database";
import { JWTpayload } from "@/app/export/DTO";
import jwt from "jsonwebtoken";
import { verify } from "@/app/lib/jwtUtil";

/** G: 추천
 *  D: 비추
 */
const ModeType = z.enum(["G", "D"]);
const schema = z.object({
    mode: ModeType,
    post: z.number(),
});

/** gaechu beechu post_id uuid */
export async function POST(req: NextRequest) {
    const body = await req.json();
    const validation = schema.safeParse({
        ...body,
    });

    if (validation.error) {
        return NextResponse.json(
            {
                message: "Param validation error",
            },
            {
                status: 400,
            }
        );
    }

    const token = req.headers.get("Authorization")!.split(" ")[1];
    const verified = verify(token);
    if (!verified.ok) {
        return NextResponse.json(
            {
                message: "로그인이 필요합니다",
            },
            {
                status: 403,
            }
        );
    }
    const payload = verified.payload!;
    const param = validation.data;

    const exist_query = `SELECT uuid FROM everytime.chu where post_id = @post and uuid = @uuid`;

    const existRes = await db.query(exist_query, {
        post: param.post,
        uuid: payload.uuid,
    });
    if (existRes.recordset.length != 0) {
        return NextResponse.json(
            {
                message: "이미 추천 하셨습니다.",
            },
            {
                status: 400,
            }
        );
    }

    const insert_query = `INSERT INTO everytime.chu (gaechu, beechu, uuid, post_id) VALUES (@like, @dislike, @uuid, @post)`;
    if (param.mode == "G") {
        /** 개추 */
        await db.query(insert_query, {
            like: true,
            dislike: false,
            uuid: payload.uuid,
            post: param.post,
        });
    } else if (param.mode == "D") {
        /** 비추 */
        await db.query(insert_query, {
            like: false,
            dislike: true,
            uuid: payload.uuid,
            post: param.post,
        });
    }
    return NextResponse.json(
        {
            message: "success",
        },
        {
            status: 200,
        }
    );
}
