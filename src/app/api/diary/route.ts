import { db } from "@/app/lib/database";
import { verify } from "@/app/lib/jwtUtil";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: NextRequest) {
    const schema = z.object({
        AA_FROM_YMD: z.string(),
        AA_TO_YMD: z.string(),
    });
    const params = req.nextUrl.searchParams;
    const valid = schema.safeParse({
        AA_FROM_YMD: params.get("AA_FROM_YMD"),
        AA_TO_YMD: params.get("AA_TO_YMD"),
    });

    /** 유저가 존재할경우 1,2,3학년 체크해서 반환 */
    const token = req.headers.get("Authorization")?.split(" ")[1] ?? "";
    const user = verify(token);

    const schedule = [];
    var data;

    if (valid.error) {
        /** 파라미터 없으면 오늘 기준 */
        data = await fetch(
            `https://open.neis.go.kr/hub/SchoolSchedule?key=${
                process.env.NEIS_API
            }&AA_FROM_YMD=${moment().format(
                "YYYYMMDD"
            )}&type=json&ATPT_OFCDC_SC_CODE=C10&SD_SCHUL_CODE=7150087`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).then((res) => res.json());
    } else {
        data = await fetch(
            `https://open.neis.go.kr/hub/SchoolSchedule?key=${process.env.NEIS_API}&AA_FROM_YMD=${valid.data.AA_FROM_YMD}&AA_TO_YMD=${valid.data.AA_TO_YMD}&type=json&ATPT_OFCDC_SC_CODE=C10&SD_SCHUL_CODE=7150087`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).then((res) => res.json());
    }
    if (!data.SchoolSchedule) {
        return NextResponse.json(
            {
                message: "success",
                diary: [],
            },
            {
                status: 200,
            }
        );
    }

    for (var item of data.SchoolSchedule[1].row as any[]) {
        if (
            ["토요휴업일", "겨울방학", "여름방학"].includes(item.EVENT_NM) &&
            valid.error
        )
            continue;

        if (user.ok) {
            switch (user.payload?.grade) {
                case 1:
                    if (item.ONE_GRADE_EVENT_YN === "N") continue;
                    break;
                case 2:
                    if (item.TW_GRADE_EVENT_YN === "N") continue;
                    break;
                case 3:
                    if (item.THREE_GRADE_EVENT_YN === "N") continue;
                    break;
            }
        }

        schedule.push({
            AA_YMD: item.AA_YMD,
            EVENT_NM: item.EVENT_NM.trim(),
        });
    }

    if (user.ok) {
        const user_schedule = (
            await db.query(
                `SELECT name, date, startTime, endTime from everytime.diary WHERE uuid=@uuid and deleted = 0`,
                {
                    uuid: user.payload?.uuid,
                }
            )
        ).recordset as any[];

        for (var item of user_schedule) {
            const date = moment(item.date).format("YYYYMMDD");
            schedule.push({
                AA_YMD: date,
                EVENT_NM: item.name,
                period: `${item.startTime} ~ ${item.endTime}`,
            });
        }
    }

    schedule.sort((left, right) =>
        moment(left.AA_YMD).utc().diff(moment(right.AA_YMD).utc())
    );

    return NextResponse.json(
        {
            message: "success",
            diary: schedule,
        },
        {
            status: 200,
        }
    );
}

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1] ?? "";
        const user = verify(token);

        if (!user.ok) {
            return NextResponse.json(
                {
                    message: "Unauthorized",
                },
                {
                    status: 403,
                }
            );
        }
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format

        const schema = z.object({
            date: z
                .string()
                .regex(dateRegex, "Invalid date format. Use YYYY-MM-DD."),
            content: z.string().max(20).min(1),
            startTime: z
                .string()
                .regex(timeRegex, "Invalid time format. Use HH:MM."),
            endTime: z
                .string()
                .regex(timeRegex, "Invalid time format. Use HH:MM."),
        });
        const valid = schema.safeParse({
            ...(await req.json()),
        });

        if (valid.error) {
            return NextResponse.json(
                {
                    message: "Params Validation Error",
                },
                {
                    status: 500,
                }
            );
        }

        await db.query(
            `INSERT INTO everytime.diary (uuid, name, date, startTime, endTime) VALUES(@uuid, @content, @date, @startTime, @endTime)`,
            {
                uuid: user.payload?.uuid,
                content: valid.data.content,
                date: valid.data.date,
                startTime: valid.data.startTime,
                endTime: valid.data.endTime,
            }
        );

        return NextResponse.json(
            {
                message: "success",
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {
                message: error,
            },
            {
                status: 500,
            }
        );
    }
}
