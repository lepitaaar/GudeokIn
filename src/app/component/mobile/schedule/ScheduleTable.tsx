"use client";

import React, { useState } from "react";
import styles from "./ScheduleTable.module.css";
import SetSubectMappingView from "./SetSubjectMapping";

const times = [
    "1교시 (8:40 ~ 9:30)",
    "2교시 (9:40 ~ 10:30)",
    "3교시 (10:40 ~ 11:30)",
    "4교시 (11:30 ~ 12:40)",
    "5교시 (13:30 ~ 14:20)",
    "6교시 (14:40 ~ 15:30)",
    "7교시 (15:40 ~ 16:30)",
];

const days = ["월", "화", "수", "목", "금"];

const colors = [
    "#FAEDCB",
    "#C9E4DE",
    "#C6DEF1",
    "#DBCDF0",
    "#F2C6DE",
    "#F7D9C4",
];

const ScheduleTable = ({
    subjects,
    grade,
    classNM,
    setSubject,
    map,
}: {
    subjects: string[][];
    grade: number;
    classNM: number;
    setSubject: Map<string, Set<string>>;
    map: any;
}) => {
    const [isSetting, setSetting] = useState<boolean>(false);

    return (
        <div className="text-center mt-2 space-y-2">
            <div className="relative h-10">
                {!isSetting ? (
                    <p className="text-2xl font-bold absolute inset-0 flex justify-center items-center m-0">
                        {grade}학년 {classNM}반 시간표
                    </p>
                ) : (
                    <p className="text-2xl font-bold absolute inset-0 flex justify-center items-center m-0">
                        세트 수업 설정
                    </p>
                )}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#5f6368"
                    className="setting absolute inset-y-0 right-0 my-auto mr-2"
                    onClick={(e) => setSetting((prev) => !prev)}
                >
                    <path d="M433-80q-27 0-46.5-18T363-142l-9-66q-13-5-24.5-12T307-235l-62 26q-25 11-50 2t-39-32l-47-82q-14-23-8-49t27-43l53-40q-1-7-1-13.5v-27q0-6.5 1-13.5l-53-40q-21-17-27-43t8-49l47-82q14-23 39-32t50 2l62 26q11-8 23-15t24-12l9-66q4-26 23.5-44t46.5-18h94q27 0 46.5 18t23.5 44l9 66q13 5 24.5 12t22.5 15l62-26q25-11 50-2t39 32l47 82q14 23 8 49t-27 43l-53 40q1 7 1 13.5v27q0 6.5-2 13.5l53 40q21 17 27 43t-8 49l-48 82q-14 23-39 32t-50-2l-60-26q-11 8-23 15t-24 12l-9 66q-4 26-23.5 44T527-80h-94Zm7-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
                </svg>
            </div>
            {!isSetting ? (
                <table className={styles.scheduleTable}>
                    <thead>
                        <tr>
                            <th>교시</th>
                            {days.map((day, index) => (
                                <th key={index}>{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {times.map((time, rowIndex) => (
                            <tr key={rowIndex}>
                                <td style={{ backgroundColor: "#f2f2f2" }}>
                                    {time}
                                </td>
                                {days.map((day, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="cell"
                                        style={
                                            subjects[colIndex][rowIndex]
                                                ? {
                                                      backgroundColor:
                                                          colors[
                                                              Math.floor(
                                                                  Math.random() *
                                                                      colors.length
                                                              )
                                                          ],
                                                  }
                                                : {}
                                        }
                                    >
                                        {map[subjects[colIndex][rowIndex]] ??
                                            subjects[colIndex][rowIndex]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <SetSubectMappingView setSubject={setSubject} existMap={map} />
            )}
            {/* <button>시간표 저장</button> */}
        </div>
    );
};

export default ScheduleTable;
