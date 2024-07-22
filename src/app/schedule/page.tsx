import React from "react";
import NavBarLayout from "../component/mobile/Header/NavBarLayout";
import ScheduleTable from "@/app/component/mobile/schedule/ScheduleTable";
import moment from "moment";
import { verify } from "../lib/jwtUtil";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "../lib/database";

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "시간표",
};

interface TimetableHead {
    list_total_count: number;
}

interface TimetableResult {
    CODE: string;
    MESSAGE: string;
}

interface TimetableRow {
    ATPT_OFCDC_SC_CODE: string;
    ATPT_OFCDC_SC_NM: string;
    SD_SCHUL_CODE: string;
    SCHUL_NM: string;
    AY: string;
    SEM: string;
    ALL_TI_YMD: string;
    DGHT_CRSE_SC_NM: string;
    ORD_SC_NM: string;
    DDDEP_NM: string;
    GRADE: string;
    CLRM_NM: string;
    CLASS_NM: number | null;
    PERIO: number;
    ITRT_CNTNT: string;
    LOAD_DTM: string;
}

interface TimetableData {
    hisTimetable: [
        { head: [TimetableHead, { RESULT: TimetableResult }] },
        { row: TimetableRow[] }
    ];
}

export default async function WeekSchedule() {
    const token = cookies().get("accessToken")!.value;
    const verified = await verify(token);

    if (!verified.ok) {
        return NextResponse.redirect(new URL("/"));
    }

    const startOfWeek = moment().startOf("isoWeek");
    const grade = verified.payload!.grade;
    const classNM = verified.payload!.class;
    var subject = [];
    var setSubject = new Map<string, Set<string>>();

    for (var i = 0; i < 5; i++) {
        const data: TimetableData = await fetch(
            `https://open.neis.go.kr/hub/hisTimetable?key=${
                process.env.NEIS_API
            }&AY=${moment().year()}&type=json&ATPT_OFCDC_SC_CODE=C10&SD_SCHUL_CODE=7150087&GRADE=${grade}&ALL_TI_YMD=${startOfWeek
                .clone()
                .add(i, "day")
                .format("YYYYMMDD")}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).then((res) => res.json());

        const parsed: TimetableRow[] = [];
        const dupCheck: Set<number> = new Set();

        data.hisTimetable[1].row.forEach((row) => {
            if (row.CLASS_NM == classNM) {
                parsed.push(row);
                dupCheck.add(row.PERIO);
            } else if (row.CLASS_NM === null) {
                /**
                 * 세트 수업
                 * ex) 세트A/수업이름/반/선생님
                 */
                const set = row.CLRM_NM.split("/");
                const values = setSubject.get(set[0]) ?? new Set<string>();
                values.add(set[1]);
                setSubject.set(set[0], values);

                if (!dupCheck.has(row.PERIO)) {
                    //세트 수업
                    dupCheck.add(row.PERIO);
                    parsed.push(row);
                }
            }
        });

        parsed.sort((a, b) => a.PERIO - b.PERIO);
        subject.push(
            parsed.map((data) => {
                if (data.CLASS_NM !== null) {
                    return data.ITRT_CNTNT;
                }
                return data.CLRM_NM.split("/")[0];
            })
        );
    }

    const valid = verify(cookies().get("accessToken")!.value);
    const map = JSON.parse(
        (
            await db.query(
                `SELECT map FROM everytime.schedule WHERE uuid = @uuid`,
                {
                    uuid: valid.payload?.uuid,
                }
            )
        ).recordset[0]?.map ?? "{}"
    );

    return (
        <NavBarLayout>
            <ScheduleTable
                grade={grade}
                classNM={classNM}
                subjects={subject}
                setSubject={setSubject}
                map={map}
            />
        </NavBarLayout>
    );
}
