import { Comment } from "@/app/export/DTO";
import { db } from "@/app/lib/database";
import { verify } from "@/app/lib/jwtUtil";
import { getUserByUUID } from "@/app/lib/user";
import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";

const schema = z.object({
    post_id: z.preprocess(
        (val) => parseInt(z.string().parse(val)),
        z.number().positive()
    ),
    group: z.preprocess(
        (val) => parseInt(z.string().parse(val)),
        z.number().positive()
    ),
});

export async function GET(req: NextRequest) {
    const params = req.nextUrl.searchParams;

    try {
        const valid = schema.parse({
            post_id: params.get("post"),
            group: params.get("parent"),
        });
        const token = req.headers.get("Authorization")?.split(" ")[1] ?? "";
        const user = verify(token);
        const commentRes = await db.query(
            `SELECT id, post_id,[group],seq,comment,uuid,date,author,type,width,height FROM everytime.comment where post_id = @post and [group] = @group and seq != 1 and deleted = 0;`,
            {
                post: valid.post_id,
                group: valid.group,
            }
        );
        const comments: Comment[] = commentRes.recordset;

        for (var comment of comments) {
            if (user.ok && comment.uuid === user.payload?.uuid) {
                comment.isAuthor = true;
            } else {
                comment.isAuthor = false;
            }
            if (comment.author.startsWith("익명")) {
                comment.profileImg = "/default-profile.webp";
                comment.uuid = "";
            } else {
                const user = await getUserByUUID(comment.uuid);
                comment.profileImg = user!.profileImage;
            }
        }

        return NextResponse.json(
            {
                message: "success",
                replyComments: comments,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    message: "Params Validation Error",
                },
                {
                    status: 500,
                }
            );
        }
    }
}
