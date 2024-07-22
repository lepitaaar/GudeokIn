import crypto from "crypto";
import { db } from "./database";

const createSalt = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if (err) reject(err);
            resolve(buf.toString("base64"));
        });
    });
};
const createHashedPassword = (
    plainPassword: string
): Promise<{ password: string; salt: string }> =>
    new Promise(async (resolve, reject) => {
        const salt = await createSalt();
        crypto.pbkdf2(
            plainPassword,
            salt,
            Number(process.env.REPEAT_NUM),
            64,
            "sha512",
            (err, key) => {
                if (err) reject(err);
                resolve({ password: key.toString("base64"), salt });
            }
        );
    });
const makePasswordHash = (
    username: string,
    plainPassword: string
): Promise<string> =>
    new Promise(async (resolve, reject) => {
        const data = await db.query(
            `select salt from everytime.users where username = @id`,
            {
                id: username,
            }
        );
        if (data.recordset.length === 0) reject("Not found User");
        const salt = JSON.parse(JSON.stringify(data))["recordset"][0].salt;
        crypto.pbkdf2(
            plainPassword,
            salt,
            Number(process.env.REPEAT_NUM),
            64,
            "sha512",
            (err, key) => {
                if (err) reject(err);
                resolve(key.toString("base64"));
            }
        );
    });
export { createHashedPassword, makePasswordHash };
