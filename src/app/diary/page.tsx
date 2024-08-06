import { cookies } from "next/headers";
import NavBarLayout from "../components/mobile/Header/NavBarLayout";
import moment from "moment";
import CalendarWrapper from "./CalendarWrapper";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "학사 일정",
};

export default async function Diary() {
    const token = cookies().get("accessToken");
    const scheduleData = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/diary?AA_FROM_YMD=${moment()
            .startOf("month")
            .format("YYYYMMDD")}&AA_TO_YMD=${moment()
            .endOf("month")
            .format("YYYYMMDD")}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token?.value}`,
            },
        }
    ).then((res) => res.json());
    const schedule = new Map<string, string[]>();
    for (var item of scheduleData.diary) {
        const AA_YMD = item.AA_YMD;
        if (!schedule.has(AA_YMD)) {
            schedule.set(AA_YMD, [item.EVENT_NM]);
        } else {
            const array = schedule.get(AA_YMD)!;
            array.push(item.EVENT_NM);
            schedule.set(AA_YMD, array);
        }
    }
    return (
        <Suspense>
            <NavBarLayout>
                <CalendarWrapper schedule={schedule} />
            </NavBarLayout>
        </Suspense>
    );
}
