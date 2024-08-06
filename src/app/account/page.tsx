import React from "react";
import NavBarLayout from "../components/mobile/Header/NavBarLayout";
import InfoPage from "@/app/components/mobile/Account/InfoPage";
import { cookies } from "next/headers";
import { verify } from "../lib/jwtUtil";
import { getUserByUUID } from "../lib/user";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "학생 정보",
};
export default async function Account() {
    const cookieStore = cookies();
    var user = null;
    try {
        const valid = verify(cookieStore.get("accessToken")!.value);

        if (!valid.ok) {
            return redirect("/");
        }
        user = await getUserByUUID(valid.payload!.uuid);
    } catch (error) {
        console.log(error);
        return redirect("/");
    }

    if (!user) {
        return redirect("/");
    }

    return (
        <NavBarLayout>
            <InfoPage user={user} />
        </NavBarLayout>
    );
}
