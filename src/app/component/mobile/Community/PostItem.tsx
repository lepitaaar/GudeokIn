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
                            className={`text-titleSize font-semibold truncate overflow-hidden text-ellipsis whitespace-nowrap ${
                                isVisited ? "text-gray-500" : ""
                            }`}
                        >
                            {post.title}
                            {post.comment_total === 0 ? (
                                <span className="ml-1 text-xs text-blue-500"></span>
                            ) : (
                                <span className="ml-1 text-xs text-blue-500">
                                    [{post.comment_total}]
                                </span>
                            )}
                        </p>
                        <p className="text-subtitleSize truncate overflow-hidden text-ellipsis whitespace-nowrap min-h-[19.5px]">
                            {post.content.replace(/(<([^>]+)>)/gi, "")}
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
