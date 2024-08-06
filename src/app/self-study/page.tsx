"use client";

import React, { useState, useRef, useCallback } from "react";
import NavBarLayout from "../components/mobile/Header/NavBarLayout";
import styles from "./SelfStudy.module.css";

const days = ["월", "화", "수", "목", "금"];
const periods = ["7교시", "8교시", "1차시", "2차시", "3차시"];

// Pre-select cells for 7th period on Tue-Fri
const preSelectedCells = new Set([
    "7교시-화",
    "7교시-수",
    "7교시-목",
    "7교시-금",
]);

type TableCellProps = {
    period: string;
    day: string;
    isSelected: boolean;
    isDisabled: boolean;
};

const TableCell: React.FC<TableCellProps> = ({
    period,
    day,
    isSelected,
    isDisabled,
}) => {
    return (
        <td
            className={`${styles.tableCell} ${
                isSelected ? styles.selected : styles.unselected
            } ${isDisabled ? styles.disabled : ""}`}
            data-period={period}
            data-day={day}
        />
    );
};

const ScheduleTable: React.FC = () => {
    const [selectedCells, setSelectedCells] =
        useState<Set<string>>(preSelectedCells);
    const tableRef = useRef<HTMLTableElement>(null);
    const isDraggingRef = useRef(false);
    const initialCellStateRef = useRef<boolean | null>(null);
    const lastToggledCellRef = useRef<string | null>(null);

    const toggleCell = useCallback(
        (period: string, day: string, forcedState?: boolean) => {
            const key = `${period}-${day}`;
            // Prevent toggling of pre-selected cells
            if (preSelectedCells.has(key)) {
                return;
            }
            setSelectedCells((prev) => {
                const newSet = new Set(prev);
                if (forcedState !== undefined) {
                    if (forcedState) {
                        newSet.add(key);
                    } else {
                        newSet.delete(key);
                    }
                } else {
                    if (newSet.has(key)) {
                        newSet.delete(key);
                    } else {
                        newSet.add(key);
                    }
                }
                return newSet;
            });
            lastToggledCellRef.current = key;
        },
        []
    );

    const getCellFromCoordinates = useCallback(
        (x: number, y: number): { period: string; day: string } | null => {
            if (!tableRef.current) return null;

            const rect = tableRef.current.getBoundingClientRect();
            const relativeX = x - rect.left;
            const relativeY = y - rect.top;

            const cellWidth = rect.width / (periods.length + 1);
            const cellHeight = rect.height / (days.length + 1);

            const periodIndex = Math.floor(relativeX / cellWidth) - 1;
            const dayIndex = Math.floor(relativeY / cellHeight) - 1;

            if (
                dayIndex >= 0 &&
                dayIndex < days.length &&
                periodIndex >= 0 &&
                periodIndex < periods.length
            ) {
                return { day: days[dayIndex], period: periods[periodIndex] };
            }

            return null;
        },
        []
    );

    const handleInteractionStart = useCallback(
        (clientX: number, clientY: number) => {
            isDraggingRef.current = true;
            const cell = getCellFromCoordinates(clientX, clientY);
            if (cell) {
                const { period, day } = cell;
                const key = `${period}-${day}`;
                initialCellStateRef.current = selectedCells.has(key);
                toggleCell(period, day);
            }
        },
        [getCellFromCoordinates, selectedCells, toggleCell]
    );

    const handleInteractionMove = useCallback(
        (clientX: number, clientY: number) => {
            if (isDraggingRef.current) {
                const cell = getCellFromCoordinates(clientX, clientY);
                if (cell) {
                    const { period, day } = cell;
                    const key = `${period}-${day}`;
                    if (key !== lastToggledCellRef.current) {
                        toggleCell(period, day, !initialCellStateRef.current);
                    }
                }
            }
        },
        [getCellFromCoordinates, toggleCell]
    );

    const handleInteractionEnd = useCallback(() => {
        isDraggingRef.current = false;
        initialCellStateRef.current = null;
        lastToggledCellRef.current = null;
    }, []);

    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            const touch = e.touches[0];
            handleInteractionStart(touch.clientX, touch.clientY);
        },
        [handleInteractionStart]
    );

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            const touch = e.touches[0];
            handleInteractionMove(touch.clientX, touch.clientY);
        },
        [handleInteractionMove]
    );

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            e.preventDefault();
            handleInteractionEnd();
        },
        [handleInteractionEnd]
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            handleInteractionStart(e.clientX, e.clientY);
        },
        [handleInteractionStart]
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            handleInteractionMove(e.clientX, e.clientY);
        },
        [handleInteractionMove]
    );

    const handleMouseUp = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            handleInteractionEnd();
        },
        [handleInteractionEnd]
    );

    return (
        <div className={styles.container}>
            <table
                ref={tableRef}
                className={styles.table}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                <thead>
                    <tr>
                        <th style={{ width: "20%" }}></th>
                        {periods.map((period) => (
                            <th key={period} className={styles.headerCell}>
                                {period}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {days.map((day) => (
                        <tr key={day}>
                            <th className={styles.periodCell}>{day}</th>
                            {periods.map((period) => (
                                <TableCell
                                    key={`${day}-${period}`}
                                    period={period}
                                    day={day}
                                    isSelected={selectedCells.has(
                                        `${period}-${day}`
                                    )}
                                    isDisabled={preSelectedCells.has(
                                        `${period}-${day}`
                                    )}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-center items-center mt-3">
                <button
                    type="submit"
                    className="w-[55px] h-[37px] bg-blue-500 text-white font-semibold"
                >
                    저장
                </button>
            </div>
        </div>
    );
};

export default function SelfStudyPage() {
    return (
        <NavBarLayout>
            <h1 className="text-center mt-2 text-xl font-semibold">
                7월 야자 신청
            </h1>
            <ScheduleTable />
        </NavBarLayout>
    );
}
