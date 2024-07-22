import { NextRequest, NextResponse } from "next/server";
import { db } from "../../lib/database";
import { verify } from "../../lib/jwtUtil";
import { User } from "../../export/DTO";
import { z } from "zod";
import sharp from "sharp";
import { randomInt } from "crypto";
import { uploadFile } from "@/app/lib/r2";
import { getUserByUUID } from "@/app/lib/user";
import moment from "moment";

export async function GET(req: NextRequest) {
    const token = req.headers.get("Authorization")!.split(" ")[1];

    try {
        const valid = verify(token);

        if (!valid.ok) {
            return NextResponse.json(
                {
                    message: valid.message,
                },
                {
                    status: 400,
                }
            );
        }

        const user = await getUserByUUID(valid.payload!.uuid);

        return NextResponse.json(
            {
                message: "success",
                info: user,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {
                message: "Internal Server Error",
            },
            {
                status: 500,
            }
        );
    }
}

const schema = z.object({
    nickname: z.string().max(20).min(1),
});

export async function POST(req: NextRequest) {
    const token = req.headers.get("Authorization")!.split(" ")[1];

    const valid = verify(token);

    if (!valid.ok) {
        return NextResponse.json(
            {
                message: valid.message,
            },
            {
                status: 400,
            }
        );
    }
    const formData = await req.formData();
    const nickname = formData.get("nickname")?.toString();

    const validSC = schema.safeParse({
        nickname: nickname,
    });
    if (validSC.error) {
        console.log(validSC.error.message);
        return NextResponse.json(
            {
                message: "Params Validation error",
            },
            {
                status: 500,
            }
        );
    }

    const file = formData.get("profile") as Blob;
    if (file != null && file !== undefined) {
        //console.log(file);
        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = file.type;

        // Check if the file is an images
        if (!/^image\/(jpeg|png|gif|webp)$/.test(mimeType)) {
            return NextResponse.json({
                message: "Invalid file type. Only images are allowed",
            });
        }

        // Generate a random filename to avoid original filename issues
        const uniqueFilename = `${new Date().getTime()}${randomInt(300)}.webp`; //${mimeType.split("/")[1]}

        // Process the image using sharp to strip metadata
        var processedBuffer: Buffer | null = null;
        if (mimeType == "image/gif") {
            processedBuffer = await sharp(buffer, { animated: true })
                .toFormat("webp")
                .toBuffer();
        } else {
            processedBuffer = await sharp(buffer).toFormat("webp").toBuffer();
        }

        const { key, loc } = await uploadFile(uniqueFilename, processedBuffer);

        await db.query(
            `UPDATE everytime.user_info SET profileImage = @url WHERE uuid = @user_uuid`,
            {
                url: loc,
                user_uuid: valid.payload!.uuid,
            }
        );
    }
    const result = await db.query(
        `
        SELECT COUNT(*) AS count
        FROM everytime.user_info
        WHERE nickname = @nickname
        AND uuid != @user_uuid
    `,
        {
            nickname: validSC.data.nickname,
            user_uuid: valid.payload!.uuid,
        }
    );
    if (result.recordset[0].count > 0) {
        return NextResponse.json(
            {
                message: "이미 존재하는 닉네임입니다.",
            },
            {
                status: 409,
            }
        );
    }
    const user = await getUserByUUID(valid.payload!.uuid);
    if (!user) {
        return NextResponse.json(
            {
                message: "Unauthorized",
            },
            {
                status: 403,
            }
        );
    }
    const today = moment();
    const nickchangeDate = moment(user!.nickchangeDate);

    if (
        user!.nickchangeDate === null ||
        today.diff(nickchangeDate, "days") >= 2
    ) {
        // 3일 이상 지났는지 확인합니다.
        if (user!.nickname !== validSC.data.nickname) {
            await db.query(
                `UPDATE everytime.user_info SET nickname=@nick, nickchangeDate=@date WHERE uuid = @user_uuid`,
                {
                    nick: validSC.data.nickname,
                    date: today.format("YYYY-MM-DD"),
                    user_uuid: valid.payload!.uuid,
                }
            );
        }
    } else {
        return NextResponse.json(
            {
                message: "닉네임은 2일 후에 변경할 수 있습니다.",
            },
            {
                status: 202,
            }
        );
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
