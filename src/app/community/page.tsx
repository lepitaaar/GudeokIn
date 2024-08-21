import NavBarLayout from "../components/mobile/Header/NavBarLayout";
import CommunityComponent from "./CommunityComponent";
import { cookies } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "게시판",
};

export default async function CommunityPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) {
    const token = cookies().get("accessToken");
    const boardData = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/boards`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token?.value}`,
            },
        }
    ).then((res) => res.json());

    var board = searchParams?.board ?? "all";
    var p = searchParams?.p ?? "1";

    if (!board) {
        board = "all";
    }
    if (!p) {
        p = "1";
    }

    const postList = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/post?board=${board}&page=${p}&perPage=40&isChuChun=false`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token?.value}`,
            },
        }
    ).then((res) => res.json());

    return (
        <NavBarLayout>
            <CommunityComponent
                boardlist={boardData.boards}
                posts={postList}
                board={board}
                p={p}
            />
        </NavBarLayout>
    );
}
