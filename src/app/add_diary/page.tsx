"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "@/app/lib/axios";
import moment from "moment";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Suspense } from "react";

function DiaryComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dateParam = searchParams.get("date");
    const initialDate = dateParam
        ? moment(dateParam, "YYYY-MM-DD").toDate()
        : new Date();
    const [schedule, setSchedule] = useState<string>("");
    const [date, setDate] = useState(initialDate);
    const [showCalendar, setShowCalendar] = useState(false);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [sending, setSending] = useState(false);

    const validateTime = (start: string, end: string) => {
        const startMoment = moment(start, "HH:mm");
        const endMoment = moment(end, "HH:mm");
        if (endMoment.isBefore(startMoment)) {
            return false;
        }
        return true;
    };

    useEffect(() => {
        if (dateParam) {
            setDate(moment(dateParam, "YYYY-MM-DD").toDate());
        }
    }, [dateParam]);

    const handleDateChange = (date: any) => {
        setDate(date);
        setShowCalendar(false);
    };

    const addSchedule = async () => {
        if (sending) {
            alert("추가 중입니다");
            return;
        }
        setSending(true);
        if (
            schedule.trim().length <= 0 ||
            startTime.trim().length <= 0 ||
            endTime.trim().length <= 0
        ) {
            alert("내용을 입력해주세요");
            setSending(false);
            return;
        }
        if (!validateTime(startTime, endTime)) {
            alert("시작시간이 종료시간보다 빨라야합니다");
            setSending(false);
            return;
        }
        if (schedule.length > 20) {
            alert("일정 내용이 너무 깁니다");
            setSending(false);
            return;
        }
        try {
            const res = await axios.post(`/api/diary`, {
                content: schedule,
                date: moment(date).format("YYYY-MM-DD"),
                startTime: startTime,
                endTime: endTime,
            });
            if (res.status === 200) {
                router.push("/diary");
            } else {
                alert("오류가 발생했습니다");
                setSending(false);
            }
        } catch (error) {
            console.log(error);
            setSending(false);
        }
    };

    return (
        <>
            <nav className="border border-none z-10 w-full h-[56px] shadow">
                <ul className="flex flex-row items-center justify-center h-full w-full">
                    <li className="flex-1">
                        <svg
                            onClick={(e) => router.back()}
                            color="#2b2b2b"
                            className="ml-3 w-[28px] h-[30px] block fill-current cursor-pointer"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                    </li>
                    <li className="flex-1 text-center">
                        <p className="font-semibold text-lg">일정 추가</p>
                    </li>
                    <li className="flex-1 mr-3 flex justify-end relative">
                        <button
                            onClick={addSchedule}
                            className="border rounded-full text-white bg-blue-600 py-[6px] px-[14px] font-semibold text-sm"
                        >
                            추가
                        </button>
                    </li>
                </ul>
            </nav>
            <main className="px-4 flex flex-grow flex-col flex-1 h-full w-full justify-center items-center z-10">
                <button
                    className="w-full font-semibold my-4 outline-none"
                    onClick={() => setShowCalendar(!showCalendar)}
                >
                    {moment(date).format("YYYY-MM-DD")}
                </button>
                <input
                    type="text"
                    className="w-full font-semibold my-4 outline-none"
                    onChange={(e) => setSchedule(e.target.value)}
                    value={schedule}
                    placeholder="일정 내용 (20글자)"
                    maxLength={20}
                    minLength={1}
                    required={true}
                />
                <div className="divider bg-gray-300 w-full h-[1px]" />
                {showCalendar && (
                    <div className="absolute z-20 bg-white shadow-lg">
                        <Calendar onChange={handleDateChange} value={date} />
                    </div>
                )}
                <div className="w-full flex flex-row my-4 justify-center items-center">
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <p className="text-sm text-gray">시간 시간</p>
                        <input
                            type="time"
                            className="w-full font-semibold outline-none px-2"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            placeholder="시작 시간"
                            required={true}
                        />
                    </div>
                    <p className="font-bold text-lg"> ~ </p>
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <p className="text-sm text-gray">종료 시간</p>
                        <input
                            type="time"
                            className="w-full font-semibold outline-none px-2"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            placeholder="종료 시간"
                            required={true}
                        />
                    </div>
                </div>
            </main>
        </>
    );
}

export default function DiaryAdd() {
    return (
        <Suspense>
            <DiaryComponent />
        </Suspense>
    );
}
