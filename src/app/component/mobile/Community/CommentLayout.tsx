"use client";

import { Comment } from "@/app/export/DTO";
import Image from "next/image";
import { useEffect, useReducer, useState } from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
import axios from "@/app/lib/axios";
import { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";

interface replyRes {
    message: string;
    replyComments: Comment[];
}

export default function MobileCommentLayout({
    commentProp,
}: {
    commentProp: Comment;
}) {
    const router = useRouter();
    const [reply, setReply] = useState<boolean>(false);
    const [replyComment, setReplyComment] = useState<string>("");
    const [comment, setComment] = useState(commentProp);
    const [blind, toggleBlind] = useReducer((state) => {
        return !state;
    }, false);

    const postReplyComment = async () => {
        setReplyComment("");
        setReply(false);
        try {
            await axios.post(`/api/comment`, {
                post: comment.post_id,
                parent: comment.group,
                comment: replyComment.replace(/(?:\r\n|\r|\n)/g, "<br>"),
                blind: blind,
            });
            getReplyComment();
            // setCommentlist(commentsRes.data.comments);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const getReplyComment = async () => {
        try {
            const replyRes: AxiosResponse<replyRes> = await axios.get(
                `/api/comment/reply?post=${comment.post_id}&parent=${comment.group}`
            );
            const tempCm = { ...comment };
            tempCm.reply = replyRes.data.replyComments;
            setComment(tempCm);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const deleteComment = async (id: number) => {
        if (confirm("댓글을 삭제 하시겠습니까?")) {
            try {
                const res = await axios.delete(`/api/comment?id=${id}`);
                if (res.status === 200) {
                    /** 땜빵 setComment prop 전달해도 댓글이 바뀌지않음 */
                    window.location.reload();
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div className="comment pt-2">
            <div className="comment-profile flex flex-row items-center justify-between w-full mb-2">
                <div className="flex flex-row items-center space-x-2">
                    <Image
                        className="w-[30px] h-[30px] rounded-lg"
                        src={comment.profileImg}
                        alt="프로필 이미지"
                        width={225}
                        height={225}
                    />
                    <div className="flex flex-col text-sm">
                        <p className="font-semibold">{comment.author}</p>
                    </div>
                </div>
                <div className="flex flex-row rounded-md space-x-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        width="24px"
                        className="cursor-pointer"
                        viewBox="0 -960 960 960"
                        fill="#a3a3a3"
                        onClick={() => setReply(!reply)}
                    >
                        <path d="m273-480 116 116q12 12 11.5 28T388-308q-12 11-28 11.5T332-308L148-492q-12-12-12-28t12-28l184-184q11-11 27.5-11t28.5 11q12 12 12 28.5T388-675L273-560h367q83 0 141.5 58.5T840-360v120q0 17-11.5 28.5T800-200q-17 0-28.5-11.5T760-240v-120q0-50-35-85t-85-35H273Z" />
                    </svg>
                    {comment.isAuthor && (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            width="24px"
                            viewBox="0 -960 960 960"
                            fill="#a3a3a3"
                            onClick={() => deleteComment(comment.id)}
                        >
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z" />
                        </svg>
                    )}
                </div>
            </div>
            <div className="comment-content">
                <p className="text-sm whitespace-pre-wrap">
                    {comment.comment.replaceAll("<br>", "\r\n")}
                </p>
                {reply && (
                    <div className="reply mt-2 text-sm flex flex-row space-x-2 items-end">
                        <ReactTextareaAutosize
                            onChange={(e) => setReplyComment(e.target.value)}
                            className="border rounded p-1 flex-grow"
                            minRows={3}
                            value={replyComment}
                            placeholder="댓글 내용입력"
                        />
                        <div className="flex flex-col">
                            <div className="flex flex-row items-center space-x-1">
                                <input
                                    id="blind"
                                    type="checkbox"
                                    checked={blind}
                                    onChange={toggleBlind}
                                    className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label
                                    htmlFor="blind"
                                    className="text-blue-600 font-bold text-sm text-nowrap"
                                >
                                    익명
                                </label>
                            </div>
                            <button
                                onClick={postReplyComment}
                                className="border p-2 px-3 h-[53px] rounded whitespace-nowrap"
                            >
                                등록
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {comment.reply?.map((cm, index) => {
                return (
                    <div
                        key={cm.group * 1000 + index}
                        className="comment-reply flex flex-row mt-3"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height={20}
                            width={20}
                            viewBox="0 -960 960 960"
                            fill="#a3a3a3"
                        >
                            <path d="M532-149q-12-12-12-28t12-28l115-115H280q-33 0-56.5-23.5T200-400v-360q0-17 11.5-28.5T240-800q17 0 28.5 11.5T280-760v360h367L531-516q-12-12-11.5-28t11.5-28q12-12 28-12.5t28 11.5l185 185q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L589-149q-12 12-28.5 12T532-149Z" />
                        </svg>
                        <div className="comment-reply-container ml-1 w-full bg-gray-100 rounded-md p-2">
                            <div className="comment-reply-profile flex flex-row items-center justify-between">
                                <div className="flex flex-row items-center space-x-2">
                                    <Image
                                        className="w-[30px] h-[30px] rounded-lg"
                                        src={cm.profileImg}
                                        alt="프로필 이미지"
                                        width={225}
                                        height={225}
                                    />
                                    <div className="flex flex-col text-sm">
                                        <p className="font-semibold">
                                            {cm.author}
                                        </p>
                                    </div>
                                </div>
                                {cm.isAuthor && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="22px"
                                        width="22px"
                                        viewBox="0 -960 960 960"
                                        fill="#a3a3a3"
                                        onClick={() => deleteComment(cm.id)}
                                    >
                                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z" />
                                    </svg>
                                )}
                            </div>
                            <div className="reply-comment-content mt-1">
                                <p className="text-sm whitespace-pre-wrap">
                                    {cm.comment.replaceAll("<br>", "\r\n")}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
