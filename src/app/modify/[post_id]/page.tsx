"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPostData, modifyPost } from "./action";
import dynamic from "next/dynamic";
import { z } from "zod";
import { Post } from "@/app/export/DTO";
const PostEditor = dynamic(
    () => import("@/app/component/mobile/Community/Editor"),
    { ssr: false }
);

export default function WriteForm({ params }: { params: { post_id: number } }) {
    const post_id = params.post_id;
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [blind, setBlind] = useState(false);
    const [board, setBoard] = useState("");
    const router = useRouter();
    const editorRef = useRef<any>(null);
    const isLoadingRef = useRef(false);

    useEffect(() => {
        async function getPost() {
            try {
                const post: Post = await getPostData(post_id);
                setTitle(post.title);
                setContent(post.content);
                setBlind(post.author === "익명");
                setBoard(post.boardType);
            } catch (error) {
                alert("비정상적인 접근");
                router.back();
            }
        }
        getPost();
    }, []);

    const onClose = () => {
        router.back();
    };

    return (
        <>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (isLoadingRef.current) {
                        return;
                    }
                    isLoadingRef.current = true;
                    const handle = await modifyPost(
                        post_id,
                        title,
                        content,
                        blind,
                        board
                    );
                    if (handle?.message) {
                        alert(handle.message);
                    } else {
                        router.back();
                    }
                }}
                className="flex flex-col"
            >
                <nav className="border border-none z-10 w-full h-[56px] shadow">
                    <ul className="flex flex-row items-center justify-center h-full w-full">
                        <li className="flex-1">
                            <svg
                                onClick={onClose}
                                color="#2b2b2b"
                                className="ml-3 w-[28px] h-[30px] block fill-current cursor-pointer"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </li>
                        <li className="flex-1 text-center">
                            <p className="font-semibold text-lg">글 쓰기</p>
                        </li>
                        <li className="flex-1 mr-3 flex justify-end relative">
                            <button className="border rounded-full text-white bg-blue-600 py-[6px] px-[14px] font-semibold text-sm">
                                완료
                            </button>
                        </li>
                    </ul>
                </nav>
                <main className="px-4 flex flex-grow flex-col flex-1 h-full w-full justify-center items-center z-10">
                    <input
                        type="text"
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                        className="w-full font-semibold my-4 outline-none"
                        placeholder="제목"
                        required={true}
                    />
                    <div className="divider bg-gray-300 w-full h-[1px]" />

                    <PostEditor
                        editorRef={editorRef}
                        initialValue={content}
                        setValues={(e) => setContent(e)}
                    />
                </main>
            </form>
            <footer className="fixed bottom-0 w-full p-3 px-4 bg-white flex flex-row justify-end items-center z-20">
                <div className="space-x-1 flex items-center">
                    <input
                        id="blind"
                        type="checkbox"
                        checked={blind}
                        onChange={(e) => {
                            setBlind(e.target.checked);
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                        htmlFor="blind"
                        className="text-blue-600 font-bold text-base"
                    >
                        익명
                    </label>
                </div>
            </footer>
        </>
    );
}
