"use client";

import React, { useRef, useState } from "react";
import axios from "@/app/lib/axios";
import { AxiosResponse, isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { z } from "zod";
import dynamic from "next/dynamic";

const PostEditor = dynamic(
    () => import("@/app/component/mobile/Community/Editor"),
    { ssr: false }
);

interface ResponseDTO {
    message: string;
    post_id: number;
}

const schema = z.object({
    title: z.string().max(100),
    content: z.string().max(10000),
    board: z.string(),
    blind: z.boolean(),
});

export default function WriteForm({ params }: { params: { bbsName: string } }) {
    const bbs = params.bbsName;
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [blind, setBlind] = useState(false);
    const router = useRouter();
    const editorRef = useRef<any>(null);
    const isLoadingRef = useRef(false);
    //중복방지
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const valid = schema.safeParse({
                title: title,
                content: content,
                board: bbs,
                blind: blind,
            });

            if (!valid.success) {
                alert("빈칸을 입력해주세요");
                isLoadingRef.current = false;
                return;
            }

            const response: AxiosResponse<ResponseDTO> = await axios.post(
                `/api/post`,
                {
                    ...valid.data,
                }
            );

            const data: ResponseDTO = response.data;
            router.replace(`/board/${bbs}/${data.post_id}`);
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                const responseError = error.response.data;
                alert(responseError.message);
            } else {
                alert(`예상치 못한 오류가 발생했습니다: ${error}`);
            }
            isLoadingRef.current = false;
        }
    };

    const onClose = () => {
        router.back();
    };

    return (
        <>
            <form
                onSubmit={(e) => {
                    if (isLoadingRef.current) {
                        e.preventDefault();
                        return;
                    }
                    isLoadingRef.current = true;
                    handleSubmit(e);
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
                        setContent={setContent}
                    />
                </main>
            </form>
            <footer className="fixed bottom-0 w-full p-3 px-4 bg-white flex flex-row justify-end items-center z-20">
                {/* <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#2b2b2b"
                >
                    <path d="M440-440ZM120-120q-33 0-56.5-23.5T40-200v-480q0-33 23.5-56.5T120-760h126l50-54q11-12 26.5-19t32.5-7h165q17 0 28.5 11.5T560-800q0 17-11.5 28.5T520-760H355l-73 80H120v480h640v-320q0-17 11.5-28.5T800-560q17 0 28.5 11.5T840-520v320q0 33-23.5 56.5T760-120H120Zm640-640h-40q-17 0-28.5-11.5T680-800q0-17 11.5-28.5T720-840h40v-40q0-17 11.5-28.5T800-920q17 0 28.5 11.5T840-880v40h40q17 0 28.5 11.5T920-800q0 17-11.5 28.5T880-760h-40v40q0 17-11.5 28.5T800-680q-17 0-28.5-11.5T760-720v-40ZM440-260q75 0 127.5-52.5T620-440q0-75-52.5-127.5T440-620q-75 0-127.5 52.5T260-440q0 75 52.5 127.5T440-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Z" />
                </svg> */}
                <div className="space-x-1 flex items-center">
                    <input
                        id="blind"
                        type="checkbox"
                        checked={blind}
                        onChange={(e) => {
                            setBlind(e.target.checked);
                            console.log(e.target.checked);
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
