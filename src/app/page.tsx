import { cookies } from "next/headers";
import NavBarLayout from "./component/mobile/Header/NavBarLayout";
import { verify } from "./lib/jwtUtil";
import { Row } from "./meal/page";
import moment from "moment";
import "moment/locale/ko";
import { getUserByUUID } from "./lib/user";
import MobilePage from "./MobilePage";
import { LoadingSpinner } from "./component/common/LoadingSpinner";

export default async function Home() {
    // after check Is mobile or desktop
    const token = cookies().get("accessToken")?.value;
    var user = undefined;
    const verified = await verify(token ?? "");
    if (verified.ok) {
        try {
            user = await getUserByUUID(verified.payload?.uuid!);
        } catch (error) {
            console.log(error);
        }
    }

    /**급식 가져오기 */
    const data = await fetch(
        `https://open.neis.go.kr/hub/mealServiceDietInfo?key=6214de9c5831476e9a2d3435a15c47e0&type=json&ATPT_OFCDC_SC_CODE=C10&SD_SCHUL_CODE=7150087&MLSV_YMD=${moment().format(
            "YYYYMMDD"
        )}`
    ).then((res) => res.json());
    const meals = data.mealServiceDietInfo?.[1].row;
    var lunch = "급식 정보가 존재하지 않습니다";
    var dinner = "급식 정보가 존재하지 않습니다";
    meals?.forEach((meal: Row) => {
        if (meal.MMEAL_SC_NM === "중식") {
            lunch = meal.DDISH_NM.replace(/\s*\([^)]*\)/g, "");
        } else if (meal.MMEAL_SC_NM === "석식") {
            dinner = meal.DDISH_NM.replace(/\s*\([^)]*\)/g, "");
        }
    });

    /**학사일정 */
    const scheduleData = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/diary`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    ).then((res) => res.json());
    var schedule: any[] = [];
    schedule = scheduleData.diary;
    /**중복 날짜 합치기 */
    schedule = schedule.reduce((acc, item) => {
        const existing = acc.find((event: any) => event.AA_YMD === item.AA_YMD);

        if (existing) {
            existing.EVENTS.push({
                EVENT_NM: item.EVENT_NM,
                period: item.period ? item.period.trim() : null,
            });
        } else {
            acc.push({
                AA_YMD: item.AA_YMD,
                EVENTS: [
                    {
                        EVENT_NM: item.EVENT_NM,
                        period: item.period ? item.period.trim() : null,
                    },
                ],
            });
        }

        return acc;
    }, []);
    return (
        <>
            {/* <LoadingSpinner /> */}
            <NavBarLayout loginModal={false}>
                <MobilePage
                    user={user}
                    schedule={schedule}
                    lunch={lunch}
                    dinner={dinner}
                />
            </NavBarLayout>
        </>
    );
}
