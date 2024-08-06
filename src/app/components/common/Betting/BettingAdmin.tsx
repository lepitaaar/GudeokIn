"use client";

import axios from "@/app/lib/axios";
import moment from "moment";
import React, { useEffect, useState } from "react";

export default function BettingAdmin() {
    const [startTime, setStartTime] = useState("");
    const [game, setGame] = useState("리그 오브 레전드");
    const [team1, setTeam1] = useState("");
    const [team2, setTeam2] = useState("");

    const addBetting = async () => {
        if (startTime.length <= 0) {
            alert(`시작시간 설정 필요`);
            return;
        }
        const start = moment(`${moment().format("YYYY-MM-DD")} ${startTime}`)
            .seconds(0)
            .format("YYYY-MM-DD HH:mm:ss");
        await axios.post(`/api/bet`, {
            game: game,
            team1: team1,
            team2: team2,
            start: start,
        });
        setTeam1("");
        setTeam2("");
        setStartTime("");
    };
    return (
        <>
            <div>
                <select
                    name=""
                    id=""
                    defaultValue={game}
                    onChange={(e) => setGame(e.target.value)}
                >
                    <option value="리그 오브 레전드">리그 오브 레전드</option>
                    <option value="발로란트">발로란트</option>
                    <option value="FC온라인4">FC온라인4</option>
                </select>
                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="팀1"
                    value={team1}
                    onChange={(e) => setTeam1(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="팀2"
                    value={team2}
                    onChange={(e) => setTeam2(e.target.value)}
                />
                <button onClick={addBetting}>추가</button>
            </div>
        </>
    );
}
