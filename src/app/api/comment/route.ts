import { Comment, JWTpayload, secret } from "@/app/export/DTO";
import { db } from "@/app/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verify } from "@/app/lib/jwtUtil";
import moment from "moment";
import { getAuthorByPostID, getPostByID, getUserByUUID } from "@/app/lib/user";
import { redis } from "@/app/lib/redis";
import { SendPush } from "@/app/lib/push";

export async function GET(req: NextRequest) {
    const params = req.nextUrl.searchParams;
    const post_id = params.get("post");

    const token = req.headers.get("Authorization")?.split(" ")[1] ?? "";
    const user = verify(token);

    const commentRes = await db.query(
        `SELECT id, post_id,[group],seq,comment,uuid,date,author,type,width,height FROM everytime.comment where post_id = @post and deleted = 0 ORDER BY [group] asc;`,
        {
            post: post_id,
        }
    );
    const comments: Comment[] = commentRes.recordset;

    const groupedComments: { [key: number]: Comment[] } = {};

    // 그룹별로 comments를 분류
    for (const comment of comments) {
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
        if (!groupedComments[comment.group]) {
            groupedComments[comment.group] = [];
        }
        groupedComments[comment.group].push(comment);
    }

    const organizedComments: Comment[] = [];

    // 그룹별로 seq가 1인 댓글을 찾아 reply 배열에 나머지 댓글을 추가
    for (const group in groupedComments) {
        const groupComments = groupedComments[group];
        const mainComment = groupComments.find((comment) => comment.seq === 1);

        if (mainComment) {
            mainComment.reply = groupComments
                .filter((comment) => comment.seq !== 1)
                .sort((a, b) => a.seq - b.seq);
            organizedComments.push(mainComment);
        } else {
            // seq가 1인 댓글이 없는 경우, 해당 그룹의 댓글을 모두 추가
            organizedComments.push(...groupComments);
        }
    }

    return NextResponse.json(
        {
            message: "success",
            comments: organizedComments,
        },
        {
            status: 200,
        }
    );
}

const schema = z.object({
    post: z.number(),
    parent: z.number().optional(),
    comment: z.string().max(300).min(1),
    blind: z.boolean(),
    type: z.string().optional(),
});

export async function POST(req: NextRequest) {
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
    const body = valid.data;
    var group = 1;
    var seq = 1;

    const token = req.headers.get("Authorization")!.split(" ")[1];
    const payload = verify(token).payload;

    const commentRes = await db.query(
        `SELECT [group], seq, uuid FROM everytime.comment where post_id = @post and deleted = 0 ORDER BY [group] desc;`,
        {
            post: body.post,
        }
    );
    const comments: Comment[] = commentRes.recordset;

    if (comments.length != 0) {
        group = comments[0].group + 1;
    }

    var parentComment: Comment[] | undefined = undefined;
    if (body.parent != undefined) {
        parentComment = comments.filter((c) => c.group == body.parent);
        if (parentComment.length != 0) {
            group = body.parent;
            parentComment.sort((a, b) => b.seq - a.seq);
            seq = parentComment[0].seq + 1;
        }
    }

    const blind_query = `INSERT INTO everytime.comment ([group], seq, post_id, comment, uuid, date, author) VALUES (@group, @seq, @post_id, @comment, @user_uuid, @date, @author)`;

    const query = `
    DECLARE @nickname NVARCHAR(50);
    SELECT @nickname = nickname FROM everytime.user_info WHERE uuid = @user_uuid;
    INSERT INTO everytime.comment ([group], seq, post_id, comment, uuid, date, author) VALUES (@group, @seq, @post_id, @comment, @user_uuid, @date, @nickname)
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
            comment: body.comment,
            user_uuid: payload?.uuid, //after encrypt save
            date: moment().format("YYYY-MM-DD HH:mm:ss"),
            author: author,
        });
    } else {
        await db.query(query, {
            group: group,
            seq: seq,
            post_id: body.post,
            comment: body.comment,
            user_uuid: payload?.uuid,
            date: moment().format("YYYY-MM-DD HH:mm:ss"),
        });
    }

    const user = await getAuthorByPostID(body.post);
    const post = await getPostByID(body.post);
    if (user?.uuid && user?.uuid !== payload?.uuid) {
        // 글쓴이와 댓글작성자가 같지않은경우
        const fcm_token = await redis.sMembers(`fcm:${user!.uuid}`);
        if (fcm_token.length !== 0) {
            for (const token of fcm_token) {
                SendPush(
                    token,
                    `${
                        body.blind
                            ? "익명"
                            : (await getUserByUUID(payload!.uuid))!.nickname
                    }님의 댓글`,
                    body.comment.replace(/(<([^>]+)>)|&nbsp;/gi, ""),
                    `https://gudeok.kr?redirect=/board/${post?.boardType}/${post?.post_id}`
                );
            }
        }
    }
    if (body.parent && parentComment?.length !== 0) {
        for (const comment of parentComment!) {
            if (comment.uuid === undefined || comment.uuid === payload?.uuid)
                continue;
            /** 이중 푸시 방지 */
            if (comment.uuid === user?.uuid) continue;
            const fcm_token = await redis.sMembers(`fcm:${comment.uuid}`);
            if (fcm_token.length !== 0) {
                for (const token of fcm_token) {
                    SendPush(
                        token,
                        `${
                            body.blind
                                ? "익명"
                                : (await getUserByUUID(payload!.uuid))!.nickname
                        }님의 댓글`,
                        body.comment.replace(/(<([^>]+)>)|&nbsp;/gi, ""),
                        `https://gudeok.kr?redirect=/board/${post?.boardType}/${post?.post_id}`
                    );
                }
            }
        }
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

export async function DELETE(req: NextRequest) {
    const params = req.nextUrl.searchParams;
    const schema = z.object({
        reply_id: z.string().min(1),
    });
    const valid = schema.safeParse({ reply_id: params.get("id") });
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
    const token = req.headers.get("Authorization")!.split(" ")[1];

    const user = verify(token);

    const comment = (
        await db.query(`SELECT uuid FROM everytime.comment where id = @id`, {
            id: valid.data.reply_id,
        })
    ).recordset[0];

    if (!comment) {
        return NextResponse.json(
            {
                message: "Not Found Comment",
            },
            {
                status: 500,
            }
        );
    }

    if (!user.ok || user.payload?.uuid !== comment.uuid) {
        return NextResponse.json(
            {
                message: "Unauthorized",
            },
            {
                status: 403,
            }
        );
    }
    await db.query(
        `
        -- 기본적으로 업데이트하려는 댓글의 정보를 가져옵니다.
        DECLARE @group INT;
        DECLARE @post_id INT;
        DECLARE @seq INT;

        -- 업데이트하려는 댓글의 그룹, 포스트 ID, 시퀀스를 가져옵니다.
        SELECT @group = [group], @post_id = post_id, @seq = seq
        FROM everytime.comment
        WHERE id = @id;

        -- 시퀀스가 1인 경우 해당 그룹과 포스트 ID의 모든 댓글을 업데이트합니다.
        IF @seq = 1
        BEGIN
            UPDATE everytime.comment
            SET deleted = 1, deleted_date = @date
            WHERE [group] = @group AND post_id = @post_id;
        END
        ELSE
        BEGIN
            -- 그렇지 않은 경우 해당 댓글만 업데이트합니다.
            UPDATE everytime.comment
            SET deleted = 1, deleted_date = @date
            WHERE id = @id;
        END
        `,
        {
            date: moment().format("YYYY-MM-DD HH:mm:ss"),
            id: valid.data.reply_id,
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
