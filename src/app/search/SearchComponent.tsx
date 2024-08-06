"use client";

import React, { useEffect, useState } from "react";
import axios from "../lib/axios";
import MobilePostItem from "../components/mobile/Community/PostItem";
import { PostResponse } from "../community/CommunityComponent";
import { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";

export default function SearchComponent({
    list,
    keyword,
}: {
    list: any;
    keyword: string;
}) {
    const [search, setSearch] = useState<string>(keyword);
    const [postlist, setPostlist] = useState<PostResponse>();
    const [visitedPosts, setVisitedPosts] = useState<any[]>([]);
    const router = useRouter();
    useEffect(() => {
        setVisitedPosts(getVisitedPosts());
        setSearch(keyword);
        setPostlist(list);
    }, []);

    const searchPost = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.replace(`/search?keyword=${search}`);
        try {
            const res: AxiosResponse<PostResponse> = await axios.get(
                `/api/post?keyword=${search}`
            );
            if (res.status === 200) {
                setPostlist(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const onClose = () => {
        router.back();
    };
    // 방문한 게시글 ID 리스트를 가져오는 함수
    const getVisitedPosts = () => {
        return JSON.parse(localStorage.getItem("visitedPosts") || "[]");
    };

    return (
        <>
            <nav className="border border-none z-10 w-full shadow px-3 py-3">
                <ul className="flex flex-row items-center justify-center h-full w-full">
                    <li className="flex-1">
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
                        <p className="font-semibold text-lg">검색</p>
                    </li>
                    <li className="flex-1 mr-3 flex justify-end relative"></li>
                </ul>
                <form onSubmit={(e) => searchPost(e)}>
                    <div className="relative flex items-center mt-4 text-gray-400 focus-within:text-gray-600">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 -960 960 960"
                            fill="#2b2b2b"
                            className="w-5 h-5 absolute ml-3 pointer-events-none"
                        >
                            <path d="M380-320q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                        </svg>
                        <input
                            type="text"
                            name="keyword"
                            placeholder="검색"
                            autoComplete="off"
                            aria-label="검색"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pr-3 pl-10 py-2 font-semibold placeholder-gray-500 text-black rounded-2xl border-none ring-2 ring-gray-300 focus:ring-gray-400 focus:ring-2 focus:outline-none"
                        />
                    </div>
                </form>
            </nav>
            <div className="mt-2">
                {postlist?.posts.map((post, index) => {
                    const isVisited = visitedPosts.includes(post.post_id);
                    return (
                        <MobilePostItem
                            key={post.post_id}
                            post={post}
                            page={1}
                            isVisited={isVisited}
                        />
                    );
                })}
            </div>
        </>
    );
}
