import { Post, User } from "../export/DTO";
import { db } from "./database";

export const getUserByUUID = async (
    uuid: string
): Promise<User | undefined> => {
    const userData = await db.query(
        `SELECT uuid, grade, class, number, role, profileImage, nickname, email,nickchangeDate from everytime.user_info where uuid = @uuid`,
        {
            uuid: uuid,
        }
    );

    if (userData.recordset.length === 0) {
        return undefined;
    }

    return userData.recordset[0] as User;
};

export const getAuthorByPostID = async (
    post_id: number
): Promise<User | undefined> => {
    const uuid = await db.query(
        `SELECT uuid from everytime.community where post_id = @id`,
        {
            id: post_id,
        }
    );

    if (uuid.recordset.length === 0) {
        return undefined;
    }
    return await getUserByUUID(uuid.recordset[0].uuid);
};

export const getPostByID = async (
    post_id: number
): Promise<Post | undefined> => {
    /**
     *
    post_id: number;
    boardType: string;
    board: string;
    title: string;
    content: string;
    date: string;
    author: string;
    uuid: string;
    seen: number;
    comment_total: number;
    like: number;
    dislike: number;
     */
    const postData = await db.query(
        `SELECT post_id, boardType, title, content, date, uuid, seen from everytime.community where post_id = @id`,
        {
            id: post_id,
        }
    );

    if (postData.recordset.length === 0) {
        return undefined;
    }
    return postData.recordset[0] as Post;
};
