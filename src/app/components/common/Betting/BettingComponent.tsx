"use client";

import { getCookie } from "cookies-next";
import moment from "moment";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import WinnerAnnouncement from "./WinnerAnnouncement";

const BettingComponent = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isBettingExist, setBettingExist] = useState(false);
    const [team1, setTeam1] = useState("");
    const [team2, setTeam2] = useState("");
    const [game, setGame] = useState("");
    const [joinTeam, setJoinTeam] = useState("");
    const [countTeam1, setCountTeam1] = useState(0);
    const [countTeam2, setCountTeam2] = useState(0);
    const [total, setTotal] = useState(0);
    const [token, setToken] = useState(getCookie("accessToken"));
    const [remainingTime, setRemainingTime] = useState("00:00");
    const [isUpcoming, setIsUpcoming] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const [isAdmin, setAdmin] = useState(false);
    const [winner, setWinner] = useState("");
    const [luckyPerson, setLuckyPerson] = useState("");
    const [showWinnerAnnouncement, setShowWinnerAnnouncement] = useState(false);

    const setupSocket = () => {
        setAdmin(false);
        const socket = io(process.env.NEXT_PUBLIC_API_HOST!, {
            path: "/api/betting/io",
            query: {
                token: token ?? "",
            },
        });

        socket.on("connect", () => {
            console.log("Connected to server");
        });

        socket.on("betting_info", (betting: any) => {
            // console.log(betting);
            setGame(betting.game);
            setTeam1(betting.team1);
            setTeam2(betting.team2);
            setTotal(betting.total);
            setCountTeam1(betting.team1_count);
            setCountTeam2(betting.team2_count);
            setBettingExist(true);
            setIsUpcoming(moment(betting.start).isBefore(moment()));
            const isExpiredNow = moment().isAfter(
                moment(betting.end, "YYYY-MM-DD HH:mm:ss")
            );
            setRemainingTime(
                isExpiredNow ? "00:00" : getRemainingTime(betting.end)
            );
            setIsExpired(isExpiredNow);
        });

        socket.on("joining_team", ({ team1, team2 }) => {
            console.log("join team!");
            if (team1) {
                setJoinTeam("team1");
            } else if (team2) {
                setJoinTeam("team2");
            }
        });

        socket.on("admin", () => {
            setAdmin(true);
        });

        socket.on("winner", (winner: any) => {
            setWinner(winner.winner);
            setLuckyPerson(winner.event);
            setShowWinnerAnnouncement(true);
            setTimeout(() => {
                setShowWinnerAnnouncement(false);
                setWinner("");
                setLuckyPerson("");
                setIsExpired(false);
                setJoinTeam("");
            }, 6000);
        });

        setSocket(socket);

        socket.on("disconnect", () => {
            console.log("Disconnected from server");
        });

        return () => {
            socket.disconnect();
        };
    };
    useEffect(() => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
            setupSocket();
        } else {
            setupSocket();
        }
    }, [token]);

    const participateTeam1 = () => {
        if (socket) {
            socket.emit("team1", true);
        }
    };

    const participateTeam2 = () => {
        if (socket) {
            socket.emit("team2", true);
        }
    };

    const nanPrevent = (value: any): number => {
        if (isNaN(value)) {
            return 0;
        }
        return value;
    };

    function getRemainingTime(endTime: string) {
        const now = moment();

        const end = moment(endTime, "YYYY-MM-DD HH:mm:ss");

        // 남은 시간 계산
        if (now.isAfter(end)) {
            return "00:00";
        }

        const duration = moment.duration(end.diff(now));

        const minutes = Math.floor(duration.asMinutes());
        const seconds = duration.seconds();

        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    const decideWinner = (team: string) => {
        if (socket) {
            socket.emit(`decideWinner`, team);
        }
    };

    useEffect(() => {
        const handleRefresh = () => {
            setToken(getCookie("accessToken"));
        };

        const url = new URL(pathname!, window.location.origin);
        url.search = searchParams!.toString();

        const observer = new MutationObserver(() => {
            if (window.location.href === url.href) {
                handleRefresh();
            }
        });

        observer.observe(document, { subtree: true, childList: true });

        return () => observer.disconnect();
    }, [pathname, searchParams]);

    return (
        isBettingExist && (
            <div className="relative betting border border-solid border-gray-300 p-3 shadow-sm rounded-lg flex flex-col justify-center items-center bg-white">
                <p className="text-lg font-semibold mb-2">예측</p>

                {isUpcoming ? (
                    <div className="inner flex flex-col items-center justify-center border-0 bg-slate-100 rounded-md w-full p-4 mb-4">
                        <p className="text-xl font-bold">{game}</p>
                        <p className="text-sm text-gray-500">
                            {isExpired
                                ? "마감되었습니다"
                                : `${remainingTime} 후에 제출이 마감됩니다`}
                        </p>
                    </div>
                ) : (
                    <p className="text-lg font-semibold text-red-600">
                        다음 예측이 준비중입니다
                    </p>
                )}

                {isUpcoming && (
                    <div className="flex flex-row w-full">
                        <div className="flex-1 flex flex-col items-end">
                            <p className="text-lg font-semibold text-blue-600">
                                {team1}
                            </p>
                            <p className="text-4xl font-bold text-blue-600">
                                {nanPrevent((countTeam1 / total) * 100).toFixed(
                                    1
                                )}
                                %
                            </p>
                            <div className="w-full h-2 mt-2 flex justify-end">
                                <div
                                    className="bg-blue-500 h-full rounded-full"
                                    style={{
                                        width: `${nanPrevent((countTeam1 / total) * 100)}%`,
                                    }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {countTeam1.toLocaleString()}명
                            </p>
                            {joinTeam === "" && token && !isExpired && (
                                <button
                                    className="mt-2 px-4 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition duration-300"
                                    onClick={participateTeam1}
                                >
                                    선택
                                </button>
                            )}
                            {isAdmin && isExpired && (
                                <button
                                    className="mt-2 px-4 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition duration-300"
                                    onClick={() => decideWinner("team1")}
                                >
                                    승리
                                </button>
                            )}
                        </div>
                        <div className="w-[2px] bg-gray-300 mx-2"></div>
                        <div className="flex-1 flex flex-col items-start">
                            <p className="text-lg font-semibold text-red-600">
                                {team2}
                            </p>
                            <p className="text-4xl font-bold text-red-600">
                                {nanPrevent((countTeam2 / total) * 100).toFixed(
                                    1
                                )}
                                %
                            </p>
                            <div className="w-full h-2 mt-2 flex justify-start">
                                <div
                                    className="bg-red-500 h-full rounded-full"
                                    style={{
                                        width: `${nanPrevent((countTeam2 / total) * 100)}%`,
                                    }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {countTeam2.toLocaleString()}명
                            </p>
                            {joinTeam === "" && token && !isExpired && (
                                <button
                                    className="mt-2 px-4 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition duration-300"
                                    onClick={participateTeam2}
                                >
                                    선택
                                </button>
                            )}
                            {isAdmin && isExpired && (
                                <button
                                    className="mt-2 px-4 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition duration-300"
                                    onClick={() => decideWinner("team2")}
                                >
                                    승리
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <WinnerAnnouncement
                    winner={winner}
                    show={showWinnerAnnouncement}
                    luckyPerson={luckyPerson}
                />
            </div>
        )
    );
};

export default BettingComponent;
