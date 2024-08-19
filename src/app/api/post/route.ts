import { NextRequest, NextResponse } from "next/server";
import { Chuchun, JWTpayload, Post, User, secret } from "@/app/export/DTO";
import jwt from "jsonwebtoken";
import { db } from "@/app/lib/database";
import { string, z } from "zod";
import moment from "moment";
import { verify } from "@/app/lib/jwtUtil";
import { getUserByUUID } from "@/app/lib/user";
import { redis } from "@/app/lib/redis";
import { SendPush } from "@/app/lib/push";

const schema = z.object({
    title: z.string().max(100),
    content: z.string().max(10000),
    board: z.string(),
    blind: z.boolean(),
});

interface PostID {
    post_id: number;
}

export async function POST(req: NextRequest) {
    const valid = schema.safeParse({
        ...(await req.json()),
    });

    if (valid.error) {
        return NextResponse.json(
            {
                message: "Params validation error",
            },
            {
                status: 500,
            }
        );
    }

    const token = req.headers.get("Authorization")!.split(" ")[1];
    const payload = jwt.verify(token, secret) as JWTpayload;

    const body = valid.data;

    const boards = (
        await db.query(
            `select boardType, admin, OneGradeOnly, TwoGradeOnly,ThirdGradeOnly from everytime.boards where deleted = 0`
        )
    ).recordset;

    const user = await getUserByUUID(payload.uuid);

    const board = boards.find((e: any) => e.boardType === body.board);
    if (board === undefined) {
        return NextResponse.json(
            {
                message: "해당 게시판이 존재하지 않습니다",
            },
            {
                status: 500,
            }
        );
    }

    if (board.admin === 1 && (user?.role ?? 0) < 1) {
        return NextResponse.json(
            {
                message: "권한이 없습니다",
            },
            {
                status: 403,
            }
        );
    }

    switch (user?.grade) {
        case 1:
            if (!board.OneGradeOnly) {
                return NextResponse.json(
                    {
                        message: "권한이 없습니다",
                    },
                    {
                        status: 403,
                    }
                );
            }
            break;
        case 2:
            if (!board.TwoGradeOnly) {
                return NextResponse.json(
                    {
                        message: "권한이 없습니다",
                    },
                    {
                        status: 403,
                    }
                );
            }
            break;
        case 3:
            if (!board.ThirdGradeOnly) {
                return NextResponse.json(
                    {
                        message: "권한이 없습니다",
                    },
                    {
                        status: 403,
                    }
                );
            }
            break;
    }

    const query = `
    DECLARE @nickname NVARCHAR(20);
    SELECT @nickname = nickname FROM everytime.user_info WHERE uuid = @user_uuid;
    
    INSERT INTO everytime.community (boardType, title, [content], date, uuid, author) VALUES (@bbs, @title, @content, @date, @user_uuid, @nickname)
    `;

    const blind_query = `    
    INSERT INTO everytime.community (boardType, title, [content], date, author, uuid) VALUES (@bbs, @title, @content, @date, '익명', @user_uuid)
    `;

    if (body.blind) {
        await db.query(blind_query, {
            bbs: body.board,
            title: body.title,
            content: body.content.replace(/(?:\r\n|\r|\n)/g, "<br>"),
            date: moment().format("YYYY-MM-DD HH:mm:ss"),
            user_uuid: payload.uuid,
        });
    } else {
        await db.query(query, {
            user_uuid: payload.uuid,
            bbs: body.board,
            title: body.title,
            content: body.content.replace(/(?:\r\n|\r|\n)/g, "<br>"),
            date: moment().format("YYYY-MM-DD HH:mm:ss"),
        });
    }
    const res = await db.query(
        `select post_id from everytime.community ORDER BY post_id desc;`
    );
    const postID: PostID[] = res.recordset;

    const alarmUsersQuery = await db.query(
        `select uuid from everytime.user_info where isCmAr = 1`
    );
    const alarmUsers: any[] = alarmUsersQuery.recordset;
    for (var alarmUser of alarmUsers) {
        if (alarmUser.uuid == payload.uuid) continue;
        const fcm_token = await redis.sMembers(`fcm:${alarmUser.uuid}`);
        if (fcm_token.length !== 0) {
            for (const token of fcm_token) {
                if (!token && token == null) continue;

                SendPush(
                    token,
                    `새로운 글`,
                    `${body.title}`,
                    `https://gudeok.kr/?redirect=/community`
                );
            }
        }
    }

    return NextResponse.json(
        {
            message: "등록 되었습니다!",
            post_id: postID[0].post_id,
        },
        {
            status: 200,
        }
    );
}

export async function DELETE(req: NextRequest) {
    const schema = z.object({
        post_id: string().transform((v: any) => parseInt(v)),
    });
    const params = req.nextUrl.searchParams;

    const valid = schema.safeParse({
        post_id: params.get("post_id"),
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
    const token = req.headers.get("Authorization")!.split(" ")[1];
    const user = verify(token);

    if (!user.ok) {
        return NextResponse.json(
            { message: "로그인이 필요합니다" },
            { status: 400 }
        );
    }

    const author_uuid = (
        await db.query(
            `SELECT uuid from everytime.community WHERE post_id = @post_id`,
            {
                post_id: valid.data.post_id,
            }
        )
    ).recordset?.[0].uuid;

    if (author_uuid !== user.payload?.uuid && user.payload!.role < 1) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await db.query(
        `UPDATE everytime.community SET deleted = 1, deleted_date = @date WHERE post_id = @post_id`,
        {
            date: moment().format("YYYY-MM-DD HH:mm:ss"),
            post_id: valid.data.post_id,
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

async function getPosts(query: string, params: any): Promise<Post[]> {
    const response = await db.query(query, params);
    return response.recordset;
}

async function getTotalCount(query: string, params: any): Promise<number> {
    const totalRes = await db.query(query, params);
    return totalRes.recordset[0].rows;
}

function filterPosts(
    posts: Post[],
    comments: any[],
    votes: Chuchun[],
    boards: any[]
): Post[] {
    return posts.map((post) => {
        post.like = 0;
        post.dislike = 0;
        post.comment_total = comments.filter(
            (c) => c.post_id === post.post_id
        ).length;
        votes
            .filter((vote) => vote.post_id === post.post_id)
            .forEach((vote) => {
                post.like += vote.gaechu;
                post.dislike += vote.beechu;
            });
        post.board =
            boards.find((board) => board.boardType === post.boardType)
                ?.display || "";
        return post;
    });
}

export async function GET(req: NextRequest) {
    const params = req.nextUrl.searchParams;
    const body = params.get("board") ?? "all";
    const page = parseInt(params.get("page") ?? "1", 10);
    const perPage = parseInt(params.get("perPage") ?? "15", 10);
    const isChuchun = params.get("isChuChun") === "true";
    const keyword = params.get("keyword");

    const token = req.headers.get("Authorization")?.split(" ")[1] ?? "";
    const user = verify(token);
    var isAdmin = (user.payload?.role ?? 0) >= 1;

    const voteRes = (
        await db.query(`select post_id, gaechu, beechu from everytime.chu`)
    ).recordset as Chuchun[];
    const comments = (
        await db.query(
            `SELECT post_id from everytime.comment where deleted = 0;`
        )
    ).recordset as any[];
    const boards = (
        await db.query(
            `SELECT display, boardType, OneGradeOnly, TwoGradeOnly, ThirdGradeOnly FROM everytime.boards`
        )
    ).recordset as any[];

    let totalCountQuery: string;
    let postsQuery: string;
    const grade = user.payload?.grade ?? 0;
    const commonParams = {
        grade,
        page,
        perPage,
        board: body,
        keyword,
        isAdmin,
    };

    if (keyword) {
        totalCountQuery = `
        SELECT COUNT(*) AS rows 
        FROM everytime.community ec
        JOIN everytime.boards b ON ec.boardType = b.boardType
        WHERE (ec.title LIKE '%' + @keyword + '%' OR ec.content LIKE '%' + @keyword + '%') 
        AND ec.deleted = 0 AND (@isAdmin = 1 OR admin = 0) AND (
            @grade = 0 AND (b.OneGradeOnly + b.TwoGradeOnly + b.ThirdGradeOnly = 3) OR
            @grade != 0 AND (
                (@grade = 1 AND b.OneGradeOnly = 1) OR 
                (@grade = 2 AND b.TwoGradeOnly = 1) OR 
                (@grade = 3 AND b.ThirdGradeOnly = 1)
            )
        )
    `;
        postsQuery = `
        SELECT ec.author, ec.boardType, ec.content, ec.date, ec.title, ec.seen, ec.post_id 
        FROM everytime.community ec
        JOIN everytime.boards b ON ec.boardType = b.boardType
        WHERE (ec.title LIKE '%' + @keyword + '%' OR ec.content LIKE '%' + @keyword + '%') 
        AND ec.deleted = 0 AND (@isAdmin = 1 OR admin = 0) AND (
            @grade = 0 AND (b.OneGradeOnly + b.TwoGradeOnly + b.ThirdGradeOnly = 3) OR
            @grade != 0 AND (
                (@grade = 1 AND b.OneGradeOnly = 1) OR 
                (@grade = 2 AND b.TwoGradeOnly = 1) OR 
                (@grade = 3 AND b.ThirdGradeOnly = 1)
            )
        )
        ORDER BY ec.post_id DESC 
        OFFSET (@page - 1) * @perPage ROWS 
        FETCH NEXT @perPage ROWS ONLY
    `;
    } else {
        if (body === "all") {
            totalCountQuery = isChuchun
                ? `
            ;WITH GaechuSum AS (
                SELECT post_id FROM everytime.chu GROUP BY post_id HAVING SUM(gaechu) >= 5
            )
            SELECT COUNT(*) AS rows 
            FROM everytime.community ec
            JOIN GaechuSum gs ON ec.post_id = gs.post_id
            JOIN everytime.boards b ON ec.boardType = b.boardType
            WHERE ec.deleted = 0 AND (@isAdmin = 1 OR admin = 0) AND (
                @grade = 0 AND (b.OneGradeOnly + b.TwoGradeOnly + b.ThirdGradeOnly = 3) OR
                @grade != 0 AND (
                    (@grade = 1 AND b.OneGradeOnly = 1) OR 
                    (@grade = 2 AND b.TwoGradeOnly = 1) OR 
                    (@grade = 3 AND b.ThirdGradeOnly = 1)
                )
            )
        `
                : `
            SELECT COUNT(*) AS rows 
            FROM everytime.community ec
            JOIN everytime.boards b ON ec.boardType = b.boardType
            WHERE ec.deleted = 0 AND (@isAdmin = 1 OR admin = 0) AND (
                @grade = 0 AND (b.OneGradeOnly + b.TwoGradeOnly + b.ThirdGradeOnly = 3) OR
                @grade != 0 AND (
                    (@grade = 1 AND b.OneGradeOnly = 1) OR 
                    (@grade = 2 AND b.TwoGradeOnly = 1) OR 
                    (@grade = 3 AND b.ThirdGradeOnly = 1)
                )
            )
        `;
            postsQuery = isChuchun
                ? `
            ;WITH GaechuSum AS (
                SELECT post_id FROM everytime.chu GROUP BY post_id HAVING SUM(gaechu) >= 5
            )
            SELECT ec.author, ec.boardType, ec.content, ec.date, ec.title, ec.seen, ec.post_id 
            FROM everytime.community ec
            JOIN GaechuSum gs ON ec.post_id = gs.post_id
            JOIN everytime.boards b ON ec.boardType = b.boardType
            WHERE ec.deleted = 0 AND (@isAdmin = 1 OR admin = 0) AND (
                @grade = 0 AND (b.OneGradeOnly + b.TwoGradeOnly + b.ThirdGradeOnly = 3) OR
                @grade != 0 AND (
                    (@grade = 1 AND b.OneGradeOnly = 1) OR 
                    (@grade = 2 AND b.TwoGradeOnly = 1) OR 
                    (@grade = 3 AND b.ThirdGradeOnly = 1)
                )
            )
            ORDER BY ec.post_id DESC 
            OFFSET (@page - 1) * @perPage ROWS 
            FETCH NEXT @perPage ROWS ONLY
        `
                : `
            SELECT ec.author, ec.boardType, ec.content, ec.date, ec.title, ec.seen, ec.post_id 
            FROM everytime.community ec
            JOIN everytime.boards b ON ec.boardType = b.boardType
            WHERE ec.deleted = 0 AND (@isAdmin = 1 OR admin = 0) AND (
                @grade = 0 AND (b.OneGradeOnly + b.TwoGradeOnly + b.ThirdGradeOnly = 3) OR
                @grade != 0 AND (
                    (@grade = 1 AND b.OneGradeOnly = 1) OR 
                    (@grade = 2 AND b.TwoGradeOnly = 1) OR 
                    (@grade = 3 AND b.ThirdGradeOnly = 1)
                )
            )
            ORDER BY ec.post_id DESC 
            OFFSET (@page - 1) * @perPage ROWS 
            FETCH NEXT @perPage ROWS ONLY
        `;
        } else {
            totalCountQuery = isChuchun
                ? `
            SELECT COUNT(*) AS rows 
            FROM everytime.community ec
            JOIN (
                SELECT post_id FROM everytime.chu GROUP BY post_id HAVING SUM(gaechu) >= 5
            ) AS gs ON ec.post_id = gs.post_id
            JOIN everytime.boards b ON ec.boardType = b.boardType
            WHERE ec.boardType = @board AND ec.deleted = 0 AND (@isAdmin = 1 OR admin = 0) AND (
                @grade = 0 AND (b.OneGradeOnly + b.TwoGradeOnly + b.ThirdGradeOnly = 3) OR
                @grade != 0 AND (
                    (@grade = 1 AND b.OneGradeOnly = 1) OR 
                    (@grade = 2 AND b.TwoGradeOnly = 1) OR 
                    (@grade = 3 AND b.ThirdGradeOnly = 1)
                )
            )
        `
                : `
            SELECT COUNT(*) AS rows 
            FROM everytime.community ec
            JOIN everytime.boards b ON ec.boardType = b.boardType
            WHERE ec.boardType = @board AND ec.deleted = 0 AND (@isAdmin = 1 OR admin = 0) AND (
                @grade = 0 AND (b.OneGradeOnly + b.TwoGradeOnly + b.ThirdGradeOnly = 3) OR
                @grade != 0 AND (
                    (@grade = 1 AND b.OneGradeOnly = 1) OR 
                    (@grade = 2 AND b.TwoGradeOnly = 1) OR 
                    (@grade = 3 AND b.ThirdGradeOnly = 1)
                )
            )
        `;
            postsQuery = isChuchun
                ? `
            ;WITH GaechuSum AS (
                SELECT post_id FROM everytime.chu GROUP BY post_id HAVING SUM(gaechu) >= 5
            )
            SELECT ec.author, ec.boardType, ec.content, ec.date, ec.title, ec.seen, ec.post_id 
            FROM everytime.community ec
            JOIN GaechuSum gs ON ec.post_id = gs.post_id
            JOIN everytime.boards b ON ec.boardType = b.boardType
            WHERE ec.boardType = @board AND ec.deleted = 0 AND (@isAdmin = 1 OR admin = 0) AND (
                @grade = 0 AND (b.OneGradeOnly + b.TwoGradeOnly + b.ThirdGradeOnly = 3) OR
                @grade != 0 AND (
                    (@grade = 1 AND b.OneGradeOnly = 1) OR 
                    (@grade = 2 AND b.TwoGradeOnly = 1) OR 
                    (@grade = 3 AND b.ThirdGradeOnly = 1)
                )
            )
            ORDER BY ec.post_id DESC 
            OFFSET (@page - 1) * @perPage ROWS 
            FETCH NEXT @perPage ROWS ONLY
        `
                : `
            SELECT ec.author, ec.boardType, ec.content, ec.date, ec.title, ec.seen, ec.post_id 
            FROM everytime.community ec
            JOIN everytime.boards b ON ec.boardType = b.boardType
            WHERE ec.boardType = @board AND ec.deleted = 0 AND (@isAdmin = 1 OR admin = 0) AND (
                @grade = 0 AND (b.OneGradeOnly + b.TwoGradeOnly + b.ThirdGradeOnly = 3) OR
                @grade != 0 AND (
                    (@grade = 1 AND b.OneGradeOnly = 1) OR 
                    (@grade = 2 AND b.TwoGradeOnly = 1) OR 
                    (@grade = 3 AND b.ThirdGradeOnly = 1)
                )
            )
            ORDER BY ec.post_id DESC 
            OFFSET (@page - 1) * @perPage ROWS 
            FETCH NEXT @perPage ROWS ONLY
        `;
        }
    }

    const totalCount = await getTotalCount(totalCountQuery, commonParams);
    const posts = await getPosts(postsQuery, commonParams);
    const filteredPosts = filterPosts(posts, comments, voteRes, boards);

    return NextResponse.json(
        {
            message: "success",
            board: body,
            total: totalCount,
            posts: filteredPosts,
        },
        { status: 200 }
    );
}
