"use client";

import { Comment, Post } from "@/app/export/DTO";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import MobileCommentLayout from "./CommentLayout";
import ReactTextareaAutosize from "react-textarea-autosize";
import axios from "@/app/lib/axios";
import { AxiosResponse, isAxiosError } from "axios";
import { changeDateFormat } from "@/app/lib/util";
import DOMPurify from "isomorphic-dompurify";

interface CommentResponse {
    message: string;
    comments: Comment[];
}

export default function MobileViewPost({
    post,
    like,
    dislike,
    authorImg,
    author,
}: {
    post: Post;
    like: number;
    dislike: number;
    authorImg: string;
    author: boolean;
}) {
    const router = useRouter();
    // const searchParams = useSearchParams();
    const [commentList, setCommentlist] = useState<Comment[]>([]);
    const [comment, setComment] = useState<string>("");
    const [gaechu, setGaechu] = useState(like);
    const [beechu, setBeechu] = useState(dislike);
    const [blind, setBlind] = useState(false);

    const onClose = () => {
        /*router.push(
            `/community?board=${post.boardType}&p=${searchParams.get("p") ?? 1}`
        )'*/
        router.back();
    };

    const getComments = async () => {
        try {
            const commentsRes: AxiosResponse<CommentResponse> = await axios.get(
                `/api/comment?post=${post.post_id}`
            );
            setCommentlist(commentsRes.data.comments);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const markPostAsVisited = (postId: number) => {
        let visitedPosts = JSON.parse(
            localStorage.getItem("visitedPosts") || "[]"
        );
        if (!visitedPosts.includes(postId)) {
            visitedPosts.push(postId);
            localStorage.setItem("visitedPosts", JSON.stringify(visitedPosts));
        }
    };

    useEffect(() => {
        getComments();
        markPostAsVisited(post.post_id);
    }, []);

    const writeComment = async () => {
        const replaceComment = comment.replace(/(?:\r\n|\r|\n)/g, "<br>");
        setComment("");
        try {
            await axios.post(`/api/comment`, {
                post: post.post_id,
                comment: replaceComment,
                blind: blind,
            });
            getComments();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const postChuchun = async (mode: "G" | "D") => {
        try {
            await axios.post(`/api/post/vote`, {
                mode: mode,
                post: post.post_id,
            });
            //status check error :(
            if (mode == "G") {
                setGaechu((rev) => rev + 1);
            } else {
                setBeechu((rev) => rev + 1);
            }
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                alert(error.response.data.message);
            }
        }
    };

    const deletePost = async () => {
        try {
            if (confirm("삭제 하시겠습니까?")) {
                const res = await axios.delete(
                    `/api/post?post_id=${post.post_id}`
                );
                if (res.status === 200) {
                    router.back();
                } else {
                    alert("오류가 발생했습니다");
                }
            }
        } catch (error) {
            alert(error);
        }
    };

    return (
        <div>
            <nav className="border border-none z-10 w-full h-[56px] shadow">
                <ul className="flex flex-row items-center justify-center h-full w-full">
                    <li className="flex-1 ml-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            onClick={onClose}
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="#2b2b2b"
                            className="cursor-pointer"
                        >
                            <path d="m142-480 294 294q15 15 14.5 35T435-116q-15 15-35 15t-35-15L57-423q-12-12-18-27t-6-30q0-15 6-30t18-27l308-308q15-15 35.5-14.5T436-844q15 15 15 35t-15 35L142-480Z" />
                        </svg>
                    </li>
                    <li className="flex-1 text-center">
                        <p className="font-semibold text-lg">{post.board}</p>
                    </li>
                    <li className="flex-1 mr-3 flex justify-end relative"></li>
                </ul>
            </nav>
            <div className="px-4 mt-2 divide-y-[1px] divide-solid space-y-2">
                <div className="z-10">
                    <div className="profile flex flex-row items-center justify-start w-full space-x-2">
                        <div className="relative w-[35px] h-[35px]">
                            <Image
                                src={authorImg}
                                className="rounded-lg object-cover"
                                alt="프로필 이미지"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>

                        <div className="flex flex-col text-sm">
                            <p className="font-semibold">{post.author}</p>
                            <p>{changeDateFormat(post.date)}</p>
                        </div>
                    </div>
                    <div className="content-body w-full space-y-2">
                        <p className="title text-xl font-bold mt-2">
                            {post.title}
                        </p>
                        <div className="content min-h-[220px]">
                            <div
                                className="ql-content"
                                style={{
                                    lineHeight: "normal",
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                        String(post.content)
                                    ),
                                }}
                            ></div>
                        </div>
                        <div className="chu flex flex-row gap-x-2 items-center justify-center">
                            <button
                                onClick={() => postChuchun("G")}
                                className="good flex flex-row border items-center rounded gap-x-1 border-gray-300 py-2 px-3.5"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height={20}
                                    width={20}
                                    viewBox="0 -960 960 960"
                                    fill="#BB271A"
                                >
                                    <path d="M840-640q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14H280v-520l240-238q15-15 35.5-17.5T595-888q19 10 28 28t4 37l-45 183h258Zm-480 34v406h360l120-280v-80H480l54-220-174 174ZM160-120q-33 0-56.5-23.5T80-200v-360q0-33 23.5-56.5T160-640h120v80H160v360h120v80H160Zm200-80v-406 406Z" />
                                </svg>
                                <p className="font-bold text-[#BB271A] text-base">
                                    {gaechu}
                                </p>
                            </button>
                            <button
                                onClick={() => postChuchun("D")}
                                className="bad flex flex-row border items-center rounded gap-x-1 border-gray-300 py-2 px-3.5"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height={20}
                                    width={20}
                                    viewBox="0 -960 960 960"
                                    fill="#2854C5"
                                >
                                    <path d="M120-320q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14h440v520L440-82q-15 15-35.5 17.5T365-72q-19-10-28-28t-4-37l45-183H120Zm480-34v-406H240L120-480v80h360l-54 220 174-174Zm200-486q33 0 56.5 23.5T880-760v360q0 33-23.5 56.5T800-320H680v-80h120v-360H680v-80h120Zm-200 80v406-406Z" />
                                </svg>
                                <p className="font-bold text-[#2854C5] text-base">
                                    {beechu}
                                </p>
                            </button>
                        </div>
                        {/** 추후 수정 관리자 한테도 수정 표시가 되지만 수정권한은 없으므로 보이지 않게 처리해야함 admin, author변수 분리해서 처리하는게 좋을듯 */}
                        {author && (
                            <div className="manage text-xs w-fit flex flex-row space-x-2">
                                <p
                                    className="cursor-pointer"
                                    onClick={() => {
                                        router.push(`/modify/${post.post_id}`);
                                    }}
                                >
                                    수정
                                </p>
                                <p
                                    className="cursor-pointer"
                                    onClick={deletePost}
                                >
                                    삭제
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="comment divide-y-[1px] divide-solid space-y-2 pb-5">
                    {commentList.map((cm, index) => {
                        return (
                            <MobileCommentLayout commentProp={cm} key={index} />
                        );
                    })}
                </div>
            </div>
            <footer className="sticky bottom-0 w-full p-3 px-4 pb-5 bg-white flex flex-row justify-between items-center z-20">
                <div className="flex flex-row items-center p-2.5 gap-x-2 bg-gray-100 w-full rounded-md">
                    <div className="space-x-1 flex items-center">
                        <input
                            id="blind"
                            type="checkbox"
                            checked={blind}
                            onChange={(e) => {
                                setBlind(e.target.checked);
                            }}
                            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                            htmlFor="blind"
                            className="text-blue-600 font-bold text-sm text-nowrap"
                        >
                            익명
                        </label>
                    </div>
                    <ReactTextareaAutosize
                        className="w-full bg-transparent outline-none text-sm h-[20px]"
                        minRows={1}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="댓글을 입력해주세요."
                        required
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height={32}
                        width={32}
                        onClick={writeComment}
                        className="cursor-pointer"
                        viewBox="0 -960 960 960"
                        fill="#2563EB"
                    >
                        <path d="M792-443 176-183q-20 8-38-3.5T120-220v-520q0-22 18-33.5t38-3.5l616 260q25 11 25 37t-25 37ZM200-280l474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
                    </svg>
                </div>
            </footer>
        </div>
    );
}
