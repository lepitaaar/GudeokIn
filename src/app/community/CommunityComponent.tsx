"use client";

import MobilePostItem from "../components/mobile/Community/PostItem";
import Link from "next/link";
import axios from "@/app/lib/axios";
import { Board, Post } from "../export/DTO";
import { AxiosResponse, isAxiosError } from "axios";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactPaginate from "react-paginate";
import Loading from "@/app/components/Loading";

export interface PostResponse {
    board: string;
    total: number;
    posts: Post[];
}

interface BoardResponse {
    boards: Board[];
}

{
    /* <div className="flex flex-col items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="22px"
                        viewBox="0 -960 960 960"
                        width="22px"
                        fill="#3b82f6"
                    >
                        <path d="m429-438-60-59q-11-11-25-11t-25 11q-11 11-11 25.5t11 25.5l85 85q10.64 11 24.82 11T454-361l187-187q11-11 11-25.5T641-599q-11-11-25-11t-25 11L429-438ZM216-144q-29.7 0-50.85-21.15Q144-186.3 144-216v-528q0-29.7 21.15-50.85Q186.3-816 216-816h171q8-31 33.5-51.5T480-888q34 0 59.5 20.5T573-816h171q29.7 0 50.85 21.15Q816-773.7 816-744v528q0 29.7-21.15 50.85Q773.7-144 744-144H216Zm0-72h528v-528H216v528Zm264-552q10.4 0 17.2-6.8 6.8-6.8 6.8-17.2 0-10.4-6.8-17.2-6.8-6.8-17.2-6.8-10.4 0-17.2 6.8-6.8 6.8-6.8 17.2 0 10.4 6.8 17.2 6.8 6.8 17.2 6.8ZM216-216v-528 528Z" />
                    </svg>
                    <p>공지사항</p>
                </div> */
}
function FloatingWrite({
    board,
    chuchun,
    setChuchunMode,
}: {
    board: string;
    chuchun: boolean;
    setChuchunMode: Dispatch<SetStateAction<boolean>>;
}) {
    const [isVisible, setIsVisible] = useState(true);
    let lastScrollY = 0;
    let timeout: any = null;

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY) {
                // 스크롤을 아래로 내리는 경우
                setIsVisible(false);
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(() => {
                    setIsVisible(true);
                }, 200);
            } else {
                // 스크롤을 위로 올리는 경우
                setIsVisible(true);
                if (timeout) {
                    clearTimeout(timeout);
                }
            }
            lastScrollY = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, []);

    return (
        <div
            id="floating-button"
            className={`fixed bottom-4 left-1/2 transform z-10 -translate-x-1/2 w-full flex justify-center transition-transform duration-300 ${
                isVisible ? "translate-y-0" : "translate-y-24"
            }`}
        >
            <div className="flex flex-row space-x-5 bg-white shadow-lg rounded-xl py-3.5 border border-gray-300 px-6 text-sm text-blue-600 items-center">
                <Link href={`/`}>
                    <div className="flex flex-col items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="#3b82f6"
                        >
                            <path d="M160-200v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-120H600q-17 0-28.5-11.5T560-160v-200q0-17-11.5-28.5T520-400h-80q-17 0-28.5 11.5T400-360v200q0 17-11.5 28.5T360-120H240q-33 0-56.5-23.5T160-200Z" />
                        </svg>
                        <p>홈</p>
                    </div>
                </Link>
                <div
                    className="flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => {
                        setChuchunMode((prev) => !prev);
                    }}
                >
                    {chuchun ? (
                        <svg
                            fill="#3b82f6"
                            height="22px"
                            width="22px"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            width="24px"
                            viewBox="0 -960 960 960"
                            fill="#3b82f6"
                        >
                            <path d="m480-285-164 98q-11 6-21.5 5t-18.5-7q-8-6-12-16.5t-1-21.5l43-183-145-123q-9-8-11-18.5t1-20.5q3-10 11-16.5t20-7.5l190-17 75-174q5-11 14-16.5t19-5.5q10 0 19 5.5t14 16.5l75 175 190 16q12 1 20 8t11 17q3 10 .5 20T798-533L654-410l43 183q3 11-1 21.5T684-189q-8 6-18.5 7t-21.5-5l-164-98Z" />
                        </svg>
                    )}
                    <p>추천글</p>
                </div>
                <Link href={`/search`}>
                    <div className="flex flex-col items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="22px"
                            viewBox="0 -960 960 960"
                            width="22px"
                            fill="#3b82f6"
                        >
                            <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                        </svg>
                        <p>검색</p>
                    </div>
                </Link>
                <Link
                    href={board === "all" ? `/write/jayoo` : `/write/${board}`}
                >
                    <div className="flex flex-col items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="22px"
                            width="22px"
                            viewBox="0 -960 960 960"
                            fill="#3b82f6"
                        >
                            <path d="M200-200h57l391-391-57-57-391 391v57Zm-40 80q-17 0-28.5-11.5T120-160v-97q0-16 6-30.5t17-25.5l505-504q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L313-143q-11 11-25.5 17t-30.5 6h-97Zm600-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                        </svg>
                        <p>글쓰기</p>
                    </div>
                </Link>
            </div>
            {/* <Link href={`/write/${board}`}>
                <button className="border-blue-600 border bg-white text-blue-600 text-sm font-semibold py-2.5 px-4 rounded-full shadow-lg">
                    글쓰기
                </button>
            </Link> */}
        </div>
    );
}

const BoardsTagList = ({
    boards,
    currentSelect,
    setSelectedBoard,
    setPage,
}: {
    boards: Board[];
    currentSelect: string;
    setSelectedBoard: (board: string) => void;
    setPage: (page: number) => void;
}) => {
    const router = useRouter();
    const changeBoard = (board: string) => {
        //window.location.href = `/community?board=${board}&p=1`;
        setPage(1);
        router.push(`/community?board=${board}&p=1`);
        // router.refresh()
        setSelectedBoard(board);
    };

    return (
        <div className="overflow-y-auto pt-3 pb-1 space-x-1 items-center flex flex-row mx-[16px] whitespace-nowrap scrollbar-hide cursor-pointer">
            {boards.map((board: Board) => {
                return (
                    <div
                        onClick={() => changeBoard(board.boardType)}
                        key={board.boardType}
                    >
                        {board.boardType === currentSelect ? (
                            <div className="shadow-md border border-none bg-blue-500 text-white rounded-full px-4 py-2">
                                <p className="text-xs">{board.display}</p>
                            </div>
                        ) : (
                            <div className="shadow-md border bg-gray-100 rounded-full px-4 py-2">
                                <p className="text-xs">{board.display}</p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
export default function CommunityComponent({
    boardlist,
}: {
    boardlist: Board[];
}) {
    const params = useSearchParams();
    const [postlist, setPostlist] = useState<PostResponse>();
    const [boards] = useState<Board[]>(boardlist);
    const [selectedBoard, setSelectedBoard] = useState<string>(
        params?.get("board") ?? "all"
    );
    const [page, setPage] = useState<number>(parseInt(params?.get("p") ?? "1"));
    const [isLoading, setLoading] = useState(true);
    const [chuchunMode, setChuchunMode] = useState(false);
    const [visitedPosts, setVisitedPosts] = useState<any[]>([]);
    const perPage = 20;
    const router = useRouter();

    const fetchPosts = async () => {
        try {
            const postRes: AxiosResponse<PostResponse> = await axios.get(
                `/api/post?board=${selectedBoard}&page=${page}&perPage=${perPage}&isChuChun=${chuchunMode}`
            );
            setPostlist(postRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    /**
     * const fetchBoards = async () => {
        try {
            const boardsRes: AxiosResponse<BoardResponse> = await axios.get(
                `/api/boards`
            );
            setSelectedBoard(
                selectedBoard ?? boardsRes.data.boards[0].boardType
            );
            setBoards(boardsRes.data.boards);
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                alert(error.response.data.message);
            }
            console.error(error);
        }
    };
     */

    useEffect(() => {
        setVisitedPosts(getVisitedPosts());
        //setSelectedBoard(params.get("board") ?? "all");
        //setPage(1);
        setLoading(true);
        fetchPosts();
    }, []);

    useEffect(() => {
        setLoading(true);
        setPage(1);
        fetchPosts();
    }, [chuchunMode, selectedBoard]);

    useEffect(() => {
        setLoading(true);
        fetchPosts();
    }, [page]);

    const handlePageClick = (event: { selected: number }) => {
        const clickedPage = event.selected + 1;
        setPage(clickedPage);
        router.push(
            `/community?board=${params?.get("board") ?? "all"}&p=${clickedPage}`
        );
    };
    // 방문한 게시글 ID 리스트를 가져오는 함수
    const getVisitedPosts = () => {
        return JSON.parse(localStorage.getItem("visitedPosts") || "[]");
    };

    return (
        <>
            <div className="mb-28">
                <BoardsTagList
                    setSelectedBoard={setSelectedBoard}
                    boards={boards}
                    setPage={setPage}
                    currentSelect={selectedBoard}
                />
                <FloatingWrite
                    board={selectedBoard}
                    chuchun={chuchunMode}
                    setChuchunMode={setChuchunMode}
                />

                {isLoading ? (
                    <>
                        <Loading />
                    </>
                ) : (
                    <>
                        <div className="flex flex-col divide-y divide-gray-200 divide-solid">
                            {postlist?.posts.map((post, index) => {
                                const isVisited = visitedPosts.includes(
                                    post.post_id
                                );
                                return (
                                    <MobilePostItem
                                        key={index}
                                        post={post}
                                        page={page}
                                        isVisited={isVisited}
                                    />
                                );
                            })}
                        </div>
                        <ReactPaginate
                            className="flex flex-row gap-x-0 items-center justify-center mb-3 mt-3"
                            pageClassName="flex items-center justify-center rounded-full h-10 w-10"
                            activeClassName="bg-gray-200"
                            previousLabel={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="#2b2b2b"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                    className="w-4 h-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                                    ></path>
                                </svg>
                            }
                            nextLabel={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="#2b2b2b"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                    className="w-4 h-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                    ></path>
                                </svg>
                            }
                            previousClassName="mr-2"
                            nextClassName="ml-2"
                            breakLabel="..."
                            pageCount={Math.ceil(
                                (postlist?.total ?? 1) / perPage
                            )}
                            initialPage={page - 1}
                            // initialPage={page - 1}
                            onPageChange={handlePageClick}
                            pageRangeDisplayed={3}
                            marginPagesDisplayed={1}
                            renderOnZeroPageCount={null}
                        />
                    </>
                )}
            </div>
        </>
    );
}
