import jwt from "jsonwebtoken";
import { JWTpayload, User } from "../export/DTO";
const secret = process.env.RSA_PRIVATE_KEY!;

const payload = (user: User) => {
    return {
        uuid: user.uuid,
        grade: user.grade,
        class: user.class,
        number: user.number,
        role: user.role,
        nickname: user.nickname,
    };
};

// access Token 발급
const sign = (user: User) => {
    return jwt.sign(payload(user), secret, {
        algorithm: "HS256", // 암호화 알고리즘
        expiresIn: "1d", // 유효기간
    });
};

const decode = (token: string) => {
    try {
        const decoded = jwt.decode(token) as JWTpayload;
        return {
            ok: true,
            payload: {
                ...decoded,
            },
        };
    } catch (error: any) {
        return {
            ok: false,
            message: error.message,
        };
    }
};

// access Token 검증
const verify = (token: string) => {
    try {
        const decoded: JWTpayload = jwt.verify(token, secret) as JWTpayload;
        return {
            ok: true,
            payload: {
                ...decoded,
            },
        };
    } catch (error: any) {
        return {
            ok: false,
            message: error.message,
        };
    }
};

// refresh Token 발급
const refresh = () => {
    return jwt.sign({}, secret, {
        algorithm: "HS256",
        expiresIn: "14d", // 유효기간
    });
};

const refreshVerify = (token: string) => {
    try {
        jwt.verify(token, secret);
        return {
            ok: true,
        };
    } catch (error: any) {
        return {
            ok: false,
            message: error.message,
        };
    }
};

export { sign, verify, refresh, refreshVerify, decode };
