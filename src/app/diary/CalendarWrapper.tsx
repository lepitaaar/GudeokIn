"use client";

import { useState } from "react";
import React from "react";
import { CustomCalendar } from "../component/mobile/Calendar/Calendar";
import Link from "next/link";
import moment from "moment";
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function CalendarWrapper({
    schedule,
}: {
    schedule: Map<string, string[]>;
}) {
    const [date, setDate] = useState<Value>(new Date());

    return (
        <>
            <CustomCalendar scheduleDate={schedule} dateFunc={setDate} />
            <Link
                href={`/add_diary?date=${moment(date?.toString()).format(
                    "YYYYMMDD"
                )}`}
            >
                <button
                    className="fixed bottom-8 right-8 p-0 w-16 h-16 bg-white rounded-full hover:bg-gray-200 mouse transition ease-in duration-200 focus:outline-none"
                    style={{
                        boxShadow: "0px 3px 8px 1px rgb(0,0,0,0.2)",
                    }}
                    aria-label="fab-submit"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 -960 960 960"
                        className="w-7 h-7 inline-block"
                        fill="#3b82f6"
                    >
                        <path d="M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z" />
                    </svg>
                </button>
            </Link>
        </>
    );
}
