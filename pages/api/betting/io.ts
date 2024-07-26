import { NextApiRequest, NextApiResponse } from "next";
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { verify } from "@/app/lib/jwtUtil";
import { redis } from "@/app/lib/redis";
import moment from "moment";
import { getUserByUUID } from "@/app/lib/user";
import { db } from "@/app/lib/database";

type NextApiResponseServer = NextApiResponse & {
    socket: {
        server: NetServer & {
            io?: SocketIOServer;
        };
    };
};

const getParticipateTeam = async (uuid: string) => {
    const isTeam1 = await redis.sIsMember("team1", uuid);
    const isTeam2 = await redis.sIsMember("team2", uuid);
    return {
        team1: isTeam1,
        team2: isTeam2,
    };
};

const sendBettingInfo = async (io: SocketIOServer) => {
    const isBettingExist = await redis.exists(`betting`);
    if (isBettingExist) {
        const betting = await redis.hGetAll(`betting`);
        const count_team1 = await redis.sCard(`team1`);
        const count_team2 = await redis.sCard(`team2`);
        io.emit(`betting_info`, {
            ...betting,
            total: count_team1 + count_team2,
            team1_count: count_team1,
            team2_count: count_team2,
        });
    }
};

let intervalId: NodeJS.Timeout | null = null;

const SocketHandler = async (
    req: NextApiRequest,
    res: NextApiResponseServer
) => {
    if (!res.socket.server.io) {
        console.log("배팅서버 시작..");
        const httpServer: NetServer = res.socket.server as any;
        const io = new SocketIOServer(httpServer, {
            path: "/api/betting/io",
        });

        io.on("connection", async (socket) => {
            console.log("A user connected");

            const token = socket.handshake.query.token as string;
            const valid = verify(token);
            const uuid = valid.payload?.uuid;

            const data = uuid ? await getParticipateTeam(uuid) : null;

            if (data && (data.team1 || data.team2)) {
                socket.emit(`joining_team`, {
                    team1: data.team1,
                    team2: data.team2,
                });
            }

            // 연결된 사용자에게 현재 betting_info 전송
            await sendBettingInfo(io);

            if (valid.ok && uuid) {
                const user = await getUserByUUID(uuid);
                socket.on("team1", async () => {
                    const join = await getParticipateTeam(uuid);
                    const isEnd = moment(
                        await redis.hGet(`betting`, "end")
                    ).isAfter(moment());
                    const isStart = moment(
                        await redis.hGet(`betting`, "start")
                    ).isBefore(moment());
                    if (!join.team1 && !join.team2 && isEnd && isStart) {
                        console.log(`team1을 ${uuid}가 선택했습니다`);
                        await redis.sAdd("team1", uuid);
                        socket.emit(`joining_team`, {
                            team1: true,
                            team2: false,
                        });
                        await sendBettingInfo(io);
                    }
                });

                socket.on("team2", async () => {
                    const join = await getParticipateTeam(uuid);
                    const isEnd = moment(
                        await redis.hGet(`betting`, "end")
                    ).isAfter(moment());
                    const isStart = moment(
                        await redis.hGet(`betting`, "start")
                    ).isBefore(moment());
                    if (!join.team1 && !join.team2 && isEnd && isStart) {
                        console.log(`team2를 ${uuid}가 선택했습니다`);
                        await redis.sAdd("team2", uuid);
                        socket.emit(`joining_team`, {
                            team1: false,
                            team2: true,
                        });
                        await sendBettingInfo(io);
                    }
                });

                socket.on("decideWinner", async (team: string) => {
                    if (user!.role >= 2) {
                        if (await redis.exists(`betting`)) {
                            const list = await redis.sMembers(team);
                            const randomIndex = Math.floor(
                                Math.random() * list.length
                            );
                            const user = await getUserByUUID(list[randomIndex]);
                            io.emit(`winner`, {
                                winner: await redis.hGet(`betting`, team),
                                event: user!.nickname,
                            });
                            await db.query(
                                `INSERT INTO everytime.gift (uuid) VALUES (@uuid)`,
                                {
                                    uuid: user!.uuid,
                                }
                            );
                            await redis.del(`betting`);
                            await redis.del(`team2`);
                            await redis.del(`team1`);
                        }
                    }
                });

                if (user!.role >= 2) {
                    socket.emit(`admin`);
                }
            }

            socket.on("disconnect", () => {
                console.log("A user disconnected");
            });
        });

        res.socket.server.io = io;

        // 전역 interval 설정
        if (!intervalId) {
            intervalId = setInterval(async () => {
                await sendBettingInfo(io);
            }, 1000);
        }
    } else {
        console.log("Socket.io server already running");
    }

    res.end();
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export default SocketHandler;
