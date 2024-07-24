"use server";

import { db } from "@/app/lib/database";
import { verify } from "@/app/lib/jwtUtil";
import { cookies } from "next/headers";
import { z } from "zod";
import moment from "moment";
import { getUserByUUID } from "@/app/lib/user";
import { revalidatePath } from "next/cache";

export async function getPostData(post_id: number) {
    "use server";
    const token = cookies().get("accessToken")!.value;
    const user = verify(token);
    if (!user.ok) {
        throw Error("유저 토큰 에러");
    }

    const result = (
        await db.query(
            `select * from everytime.community where post_id = @id and deleted = 0 and uuid = @uuid`,
            {
                id: post_id,
                uuid: user.payload?.uuid,
            }
        )
    ).recordset;
    if (result.length <= 0) {
        throw Error("게시물을 찾지 못했습니다");
    }
    return result[0];
}

export async function modifyPost(
    post_id: number,
    title: string,
    content: string,
    blind: boolean,
    board: string
) {
    const schema = z.object({
        title: z.string().max(100),
        content: z.string().max(10000),
        board: z.string(),
        blind: z.boolean(),
    });

    const valid = schema.safeParse({
        title: title,
        content: content,
        blind: blind,
        board: board,
    });

    if (valid.error) {
        return { message: "Params Validation Error" };
    }

    const token = cookies().get("accessToken")!.value;
    const valid_token = verify(token);
    if (!valid_token.ok) {
        return { message: "유저 토큰 에러" };
    }
    var author = "익명";
    if (!blind) {
        author = (await getUserByUUID(valid_token.payload!.uuid))!.nickname;
    }

    try {
        await db.query(
            `UPDATE everytime.community SET title = @title, content = @content, author = @author, modified_date = @date WHERE post_id = @id and uuid = uuid`,
            {
                title: title,
                content: content,
                author: author,
                date: moment().format("YYYY-MM-DD hh:mm:ss"),
                id: post_id,
                uuid: valid_token.payload!.uuid,
            }
        );
    } catch (error) {
        console.log(error);
        return { message: "데이터베이스 오류" };
    }
}
