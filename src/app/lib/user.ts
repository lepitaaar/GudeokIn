import { User } from "../export/DTO";
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
