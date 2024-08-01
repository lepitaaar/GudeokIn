"use client";

import { useReducer, useState } from "react";
import axios from "@/app/lib/axios";
import ReactTextareaAutosize from "react-textarea-autosize";
import { Post } from "@/app/export/DTO";
import { isAxiosError } from "axios";

export default function ReplyLayout({
    post,
    getComments,
}: {
    post: Post;
    getComments: () => void;
}) {
    const [comment, setComment] = useState<string>("");
    const [blind, toggleBlind] = useReducer((state) => {
        return !state;
    }, false);

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

    const writeCommentPhoto = async () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();
        input.addEventListener("change", async () => {
            if (input.files === undefined || input.files?.length == 0) return;
            const file = input.files![0];
            try {
                setComment("");
                await axios.post(
                    `/api/comment/file`,
                    {
                        post: post.post_id,
                        blind: blind,
                        file: file,
                    },
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                getComments();
            } catch (error) {
                if (isAxiosError(error) && error.response) {
                    alert(error.response.data.message);
                }
                console.log(error);
            }
        });
    };
    return (
        <footer className="sticky bottom-0 w-full p-3 px-4 pb-5 bg-white flex flex-row justify-between items-center z-20">
            <div className="flex flex-row items-center p-2.5 gap-x-2 bg-gray-100 w-full rounded-md">
                <div className="space-x-1 flex items-center">
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
                <ReactTextareaAutosize
                    className="w-full bg-transparent outline-none text-sm h-[20px]"
                    minRows={1}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="댓글을 입력해주세요."
                    required
                />
                {comment.length <= 0 ? (
                    <>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height={32}
                            width={32}
                            viewBox="0 -960 960 960"
                            fill="#2563EB"
                            className="cursor-pointer"
                            onClick={writeCommentPhoto}
                        >
                            <path d="M440-440ZM120-120q-33 0-56.5-23.5T40-200v-480q0-33 23.5-56.5T120-760h126l50-54q11-12 26.5-19t32.5-7h165q17 0 28.5 11.5T560-800q0 17-11.5 28.5T520-760H355l-73 80H120v480h640v-320q0-17 11.5-28.5T800-560q17 0 28.5 11.5T840-520v320q0 33-23.5 56.5T760-120H120Zm640-640h-40q-17 0-28.5-11.5T680-800q0-17 11.5-28.5T720-840h40v-40q0-17 11.5-28.5T800-920q17 0 28.5 11.5T840-880v40h40q17 0 28.5 11.5T920-800q0 17-11.5 28.5T880-760h-40v40q0 17-11.5 28.5T800-680q-17 0-28.5-11.5T760-720v-40ZM440-260q75 0 127.5-52.5T620-440q0-75-52.5-127.5T440-620q-75 0-127.5 52.5T260-440q0 75 52.5 127.5T440-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Z" />
                        </svg>
                    </>
                ) : (
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
                )}
            </div>
        </footer>
    );
}
