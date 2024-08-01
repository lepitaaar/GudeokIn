export const secret = process.env.RSA_PRIVATE_KEY!;

/** username, password, uuid, refreshToken */
export interface User {
    uuid: string;
    nickname: string;
    grade: number;
    class: number;
    number: number;
    role: number;
    profileImage: string;
    nickchangeDate?: string;
}

export interface Chuchun {
    post_id: number;
    gaechu: number;
    beechu: number;
}

export interface JWTpayload {
    uuid: string;
    grade: number;
    class: number;
    number: number;
    role: number;
    nickname: string;
}

export interface Post {
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
}

export interface Board {
    boardType: string;
    display: string;
}

export interface Comment {
    id: number;
    post_id: number;
    group: number;
    seq: number;
    comment: string;
    uuid: string;
    date: string;
    author: string;
    type: string;
    profileImg: string;
    isAuthor: boolean;
    width?: number;
    height?: number;
    reply?: Comment[];
}
