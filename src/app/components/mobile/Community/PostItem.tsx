import { Post } from "@/app/export/DTO";
import { ChangeDateToSigan } from "@/app/lib/util";
import { useRouter } from "next/navigation";
import React from "react";

export default function MobilePostItem({
    post,
    page,
    isVisited,
}: {
    post: Post;
    page: number;
    isVisited: boolean;
}) {
    const router = useRouter();

    const onClick = () => {
        router.push(`/board/${post.boardType}/${post.post_id}?p=${page}`);
        //router.back();
    };

    return (
        <>
            <div
                onClick={onClick}
                className="post_list w-full h-[80px] border border-none overflow-hidden cursor-pointer"
            >
                <div className="content grid grid-cols-[1fr_auto] h-full mx-[16px] items-center">
                    <div className="flex flex-col w-full overflow-hidden space-y-0.5">
                        <p
                            className={`flex items-center truncate overflow-hidden text-ellipsis whitespace-nowrap ${
                                isVisited ? "text-gray-500" : ""
                            }`}
                        >
                            {post.like >= 5 && (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="20px"
                                    viewBox="0 -960 960 960"
                                    width="20px"
                                    fill="#EAC452"
                                    className=""
                                >
                                    <path d="M480-269 314-169q-11 7-23 6t-21-8q-9-7-14-17.5t-2-23.5l44-189-147-127q-10-9-12.5-20.5T140-571q4-11 12-18t22-9l194-17 75-178q5-12 15.5-18t21.5-6q11 0 21.5 6t15.5 18l75 178 194 17q14 2 22 9t12 18q4 11 1.5 22.5T809-528L662-401l44 189q3 13-2 23.5T690-171q-9 7-21 8t-23-6L480-269Z" />
                                </svg>
                            )}
                            <span className="font-semibold text-titleSize truncate">
                                {post.title}
                            </span>
                            {post.comment_total > 0 && (
                                <span className="ml-1 text-xs text-blue-500 flex-shrink-0">
                                    [{post.comment_total}]
                                </span>
                            )}
                        </p>
                        <p className="text-subtitleSize truncate overflow-hidden text-ellipsis whitespace-nowrap min-h-[19.5px]">
                            {post.content.replace(/(<([^>]+)>)|&nbsp;/gi, "")}
                        </p>
                        <div className="flex flex-row text-[10px] space-x-1.5 overflow-hidden">
                            <p className="board">{post.board}</p>
                            <p>{post.author}</p>
                            <p>{ChangeDateToSigan(post.date)}</p>
                            <p>조회수 {post.seen}</p>
                            <p>좋아요 {post.like}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
