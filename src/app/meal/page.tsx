import { Suspense } from "react";
import NavBarLayout from "../components/mobile/Header/NavBarLayout";
import MobileMealCarousel from "../components/mobile/Meal/MealCarousel";
import { getWeekdaysDates } from "../lib/util";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "급식 정보",
};
interface Result {
    CODE: string;
    MESSAGE: string;
}

interface Head {
    list_total_count: number;
    RESULT: Result;
}

export interface Row {
    ATPT_OFCDC_SC_CODE: string;
    ATPT_OFCDC_SC_NM: string;
    SD_SCHUL_CODE: string;
    SCHUL_NM: string;
    MMEAL_SC_CODE: string;
    MMEAL_SC_NM: string;
    MLSV_YMD: string;
    MLSV_FGR: number;
    DDISH_NM: string;
    ORPLC_INFO: string;
    CAL_INFO: string;
    NTR_INFO: string;
    MLSV_FROM_YMD: string;
    MLSV_TO_YMD: string;
    LOAD_DTM: string;
}

export interface MealServiceDietInfo {
    head: Head[];
    row: Row[];
}

interface MealServiceDietInfoResponse {
    mealServiceDietInfo: MealServiceDietInfo[];
}

interface MealContent {
    cal: string;
    DDISH_NM: string;
}

export interface DayOfMeal {
    type: "석식" | "중식";
    menu: MealContent;
}

export default async function MealPage() {
    const range = getWeekdaysDates();
    const res = await fetch(
        `https://open.neis.go.kr/hub/mealServiceDietInfo?key=6214de9c5831476e9a2d3435a15c47e0&type=json&ATPT_OFCDC_SC_CODE=C10&SD_SCHUL_CODE=7150087&MLSV_FROM_YMD=${range[0]}&MLSV_TO_YMD=${range[4]}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    ).then((res) => res.json());

    const parsedData: MealServiceDietInfoResponse = JSON.parse(
        JSON.stringify(res)
    );
    const dataArray = parsedData.mealServiceDietInfo?.[1]?.row ?? [];
    const dayOfWeek = ["월", "화", "수", "목", "금"];
    const mealArray: { [key: string]: DayOfMeal[] } = {
        월: [],
        화: [],
        수: [],
        목: [],
        금: [],
    };

    dayOfWeek.forEach((day, index) => {
        if (dataArray || dataArray > 0) {
            const filter = dataArray.filter(
                (row) => row.MLSV_YMD === range[index]
            );
            filter.forEach((item) => {
                mealArray[day].push({
                    type: item.MMEAL_SC_NM as "중식" | "석식",
                    menu: {
                        cal: item.CAL_INFO,
                        DDISH_NM: item.DDISH_NM,
                    },
                });
            });
        }
    });

    return (
        <>
            <Suspense>
                <NavBarLayout>
                    {/* data={parsedData.mealServiceDietInfo[1].row */}
                    <MobileMealCarousel items={mealArray} />
                </NavBarLayout>
            </Suspense>
        </>
    );
}
