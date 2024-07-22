"use client";

import { Dispatch, SetStateAction, useState } from "react";
import {
    StyledCalendarWrapper,
    StyledCalendar,
    StyledDate,
    StyledToday,
    StyledDot,
} from "./styles";
import moment from "moment";
import "react-calendar/dist/Calendar.css";
import "moment/locale/ko";
import axios from "@/app/lib/axios";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export const CustomCalendar = ({
    scheduleDate,
    dateFunc,
}: {
    scheduleDate: Map<string, string[]>;
    dateFunc: Dispatch<SetStateAction<Value>>;
}) => {
    const today = new Date();
    const [date, setDate] = useState<Value>(today);
    const [activeStartDate, setActiveStartDate] = useState<Date | null>(
        new Date()
    );
    const [schedule, setSchedule] =
        useState<Map<string, string[]>>(scheduleDate);

    const handleDateChange = async (newDate: Value) => {
        setDate(newDate);
        dateFunc(newDate);
    };

    const handleTodayClick = () => {
        const today = new Date();
        setActiveStartDate(today);
        setDate(today);
    };

    return (
        <>
            <StyledCalendarWrapper>
                <StyledCalendar
                    value={date}
                    onChange={handleDateChange}
                    formatDay={(locale, date) => moment(date).format("D")}
                    formatYear={(locale, date) => moment(date).format("YYYY")}
                    formatMonthYear={(locale, date) =>
                        moment(date).format("YYYY. MM")
                    }
                    calendarType="gregory"
                    showNeighboringMonth={false}
                    next2Label={null}
                    prev2Label={null}
                    minDetail="year"
                    activeStartDate={activeStartDate ?? undefined}
                    onActiveStartDateChange={async ({ activeStartDate }) => {
                        console.log("cahgne month");
                        const date = moment(activeStartDate);

                        const sc_data = await axios.get(
                            `/api/diary?AA_FROM_YMD=${date
                                .startOf("month")
                                .format("YYYYMMDD")}&AA_TO_YMD=${date
                                .endOf("month")
                                .format("YYYYMMDD")}`
                        );
                        if (sc_data.status === 200) {
                            const tm_schedule = new Map<string, string[]>();
                            for (var item of sc_data.data.diary) {
                                if (!tm_schedule.has(item.AA_YMD)) {
                                    tm_schedule.set(item.AA_YMD, [
                                        item.EVENT_NM,
                                    ]);
                                } else {
                                    const tm_array = tm_schedule.get(
                                        item.AA_YMD
                                    )!;
                                    tm_array.push(item.EVENT_NM);
                                    tm_schedule.set(item.AA_YMD, tm_array);
                                }
                            }
                            setSchedule(tm_schedule);
                        }
                        setActiveStartDate(activeStartDate);
                    }}
                    // 오늘 날짜에 '오늘' 텍스트 삽입하고 출석한 날짜에 점 표시를 위한 설정
                    tileContent={({ date, view }) => {
                        const formattedDate = moment(date).format("YYYYMMDD");
                        let html = [];
                        if (
                            view === "month" &&
                            date.getMonth() === today.getMonth() &&
                            date.getDate() === today.getDate() &&
                            !schedule.has(formattedDate)
                        ) {
                            html.push(
                                <StyledToday key={"today"}>오늘</StyledToday>
                            );
                        }
                        if (schedule.has(formattedDate)) {
                            html.push(<StyledDot key={formattedDate} />);
                        }
                        return <>{html}</>;
                    }}
                />
                <StyledDate onClick={handleTodayClick}>오늘</StyledDate>
            </StyledCalendarWrapper>
            <div>
                {schedule
                    .get(moment(date?.toString()).format("YYYYMMDD"))
                    ?.map((ele) => {
                        return (
                            <div
                                key={ele}
                                className="flex flex-row items-center space-x-4 m-3"
                            >
                                <div className="flex flex-col items-center justify-center w-14 h-14 bg-blue-500 text-white text-xl font-bold rounded-full">
                                    <p className="text-base">
                                        {moment(date?.toString()).format("DD")}
                                    </p>
                                    <span className="text-sm overflow-hidden">
                                        {moment(date?.toString()).format("ddd")}
                                    </span>
                                </div>
                                <p className="text-lg">{ele}</p>
                            </div>
                        );
                    })}
            </div>
        </>
    );
};
