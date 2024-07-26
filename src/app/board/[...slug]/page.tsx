import MobileViewPost from "@/app/component/mobile/Community/ViewPost";
import { Chuchun, Post } from "@/app/export/DTO";
import { db } from "@/app/lib/database";
import { getUserByUUID } from "@/app/lib/user";
import { User } from "@/app/export/DTO";
import { cookies } from "next/headers";
import { verify } from "@/app/lib/jwtUtil";
import { redirect } from "next/navigation";

export default async function ViewPost({
    params,
}: {
    params: { slug: string[] };
}) {
    const board = params.slug[0];
    const post_id = Number(params.slug[1]);
    var author = false;
    const response = await db.query(
        `select * from everytime.community where boardType = @board and post_id = @id and deleted = 0`,
        {
            board: board,
            id: post_id,
        }
    );

    if (response.recordset.length <= 0) {
        redirect("/");
    }

    const post: Post = response.recordset[0];

    const user: User | undefined = await getUserByUUID(post.uuid);

    const token = cookies().get("accessToken");
    if (token) {
        const verified = verify(token.value);
        var current_user: User | undefined = undefined;
        if (verified.ok) {
            current_user = await getUserByUUID(verified.payload!.uuid);
            author = current_user?.uuid === user?.uuid;
            if (current_user!.role >= 1) {
                author = true;
            }
        }
        const permission = (
            await db.query(
                `SELECT admin FROM everytime.boards where boardType = @board`,
                {
                    board: post.boardType,
                }
            )
        ).recordset?.[0];
        if (
            permission?.admin > 0 &&
            permission?.admin !== Number((current_user?.role ?? 0) >= 1)
        ) {
            redirect("/");
        }
    }

    var [like, dislike] = [0, 0];
    const voteRes = await db.query(
        `select gaechu, beechu from everytime.chu where post_id = @id`,
        {
            id: post_id,
        }
    );
    for (var vote of voteRes.recordset as Chuchun[]) {
        like += vote.gaechu;
        dislike += vote.beechu;
    }

    await db.query(
        `UPDATE everytime.community SET seen += 1 WHERE post_id = @id`,
        {
            id: post_id,
        }
    );
    const name = (
        await db.query(
            `SELECT display FROM everytime.boards WHERE boardType = @type`,
            {
                type: post.boardType,
            }
        )
    ).recordset?.[0].display;

    if (name === undefined) throw Error("Not Found Board");

    post.board = name;

    return (
        <>
            <MobileViewPost
                post={post}
                like={like}
                dislike={dislike}
                authorImg={
                    post.author === "익명"
                        ? "/default-profile.webp"
                        : user!.profileImage
                }
                author={author}
            />
        </>
    );
}
