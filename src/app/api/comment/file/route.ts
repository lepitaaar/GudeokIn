import { Comment } from "@/app/export/DTO";
import { db } from "@/app/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verify } from "@/app/lib/jwtUtil";
import moment from "moment";
import sharp from "sharp";
import { randomInt } from "crypto";
import { uploadFile } from "@/app/lib/r2";

const schema = z.object({
    post: z.string().transform((v) => parseInt(v)),
    parent: z
        .string()
        .transform((v) => parseInt(v))
        .optional(),
    blind: z.boolean(),
});

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const valid = schema.safeParse({
        post: formData.get("post"),
        blind: Boolean(formData.get("blind") === "true"),
        parent: formData.get("parent") ?? undefined,
    });
    if (valid.error) {
        console.log(valid.error);
        return NextResponse.json(
            {
                message: "Params Validation error",
            },
            {
                status: 500,
            }
        );
    }
    const body = valid.data;
    var group = 1;
    var seq = 1;

    const token = req.headers.get("Authorization")!.split(" ")[1];
    const payload = verify(token).payload;

    const commentRes = await db.query(
        `SELECT [group], seq FROM everytime.comment where post_id = @post and deleted = 0 ORDER BY [group] desc;`,
        {
            post: body.post,
        }
    );
    const comments: Comment[] = commentRes.recordset;

    if (comments.length != 0) {
        group = comments[0].group + 1;
    }
    if (body.parent != undefined) {
        const parentComment = comments.filter((c) => c.group == body.parent);
        if (parentComment.length != 0) {
            group = body.parent;
            parentComment.sort((a, b) => b.seq - a.seq);
            seq = parentComment[0].seq + 1;
        }
    }

    var file: Blob | undefined = (formData.get("file") as Blob) ?? undefined;

    if (!file) {
        return NextResponse.json({
            message: "No file uploaded",
        });
    }

    var complete_file: any = {};

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;
    if (!/^image\/(jpeg|png|gif|webp)$/.test(mimeType)) {
        return NextResponse.json(
            {
                message: "지원하지 않은 형식입니다",
            },
            {
                status: 500,
            }
        );
    }
    const uniqueFilename = `${new Date().getTime()}${randomInt(300)}.webp`;

    const metadata = await sharp(buffer).metadata();
    const { width } = metadata;

    var processedBuffer: Buffer | null = null;
    const resizeOption = width! >= 700 ? { width: 700 } : { width: width };

    processedBuffer = await sharp(buffer, { animated: true })
        .resize(resizeOption)
        .toFormat("webp")
        .toBuffer();

    const processed = await sharp(processedBuffer).metadata();

    const { key, loc } = await uploadFile(uniqueFilename, processedBuffer);
    complete_file = {
        url: loc,
        width: processed.width,
        height: processed.height,
    };

    const blind_query = `INSERT INTO everytime.comment ([group], seq, post_id, comment, uuid, date, author, type, width, height) VALUES (@group, @seq, @post_id, @comment, @user_uuid, @date, @author, 'image', ${complete_file.width}, ${complete_file.height})`;

    const query = `
    DECLARE @nickname NVARCHAR(50);
    SELECT @nickname = nickname FROM everytime.user_info WHERE uuid = @user_uuid;
    INSERT INTO everytime.comment ([group], seq, post_id, comment, uuid, date, author, type, width, height) VALUES (@group, @seq, @post_id, @comment, @user_uuid, @date, @nickname, 'image', ${complete_file.width}, ${complete_file.height})
    `;

    if (body.blind) {
        const author_uuid = (
            await db.query(
                `SELECT uuid FROM everytime.community WHERE post_id = @post and deleted = 0`,
                {
                    post: body.post,
                }
            )
        ).recordset[0].uuid;

        var author = "익명";
        if (payload?.uuid == author_uuid) {
            author = "익명(글쓴이)";
        }

        await db.query(blind_query, {
            group: group,
            seq: seq,
            post_id: body.post,
            comment: complete_file.url,
            user_uuid: payload?.uuid, //after encrypt save
            date: moment().format("YYYY-MM-DD HH:mm:ss"),
            author: author,
        });
    } else {
        await db.query(query, {
            group: group,
            seq: seq,
            post_id: body.post,
            comment: complete_file.url,
            user_uuid: payload?.uuid,
            date: moment().format("YYYY-MM-DD HH:mm:ss"),
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
