import admin from "firebase-admin";
import { Message } from "firebase-admin/messaging";

if (!admin.apps.length) {
    const serviceAccount = require("@/../service_key.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export const SendPush = async (
    token: string,
    title: string,
    message: string
    // link: string
) => {
    console.log("push 알림");
    const payload: Message = {
        token,
        data: {
            title: title,
            body: message,
        },
        // webpush: {
        //     fcmOptions: {
        //         link,
        //     },
        // },
    };

    try {
        await admin.messaging().send(payload);
    } catch (error) {
        console.error(error);
    }
};
