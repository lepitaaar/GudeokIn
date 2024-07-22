import NavBarLayout from "../component/mobile/Header/NavBarLayout";
import CommunityComponent from "./CommunityComponent";
import { cookies } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "게시판",
};

export default async function CommunityPage() {
    const token = cookies().get("accessToken");
    const scheduleData = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/boards`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token?.value}`,
            },
        }
    ).then((res) => res.json());
    return (
        <NavBarLayout>
            <CommunityComponent boardlist={scheduleData.boards} />
        </NavBarLayout>
    );
}
