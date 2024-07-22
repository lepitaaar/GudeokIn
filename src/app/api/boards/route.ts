import { Board, JWTpayload, User, secret } from "@/app/export/DTO";
import { NextRequest, NextResponse } from "next/server";
import { verify } from "@/app/lib/jwtUtil";
import { db } from "@/app/lib/database";
import { getUserByUUID } from "@/app/lib/user";

export async function GET(req: NextRequest) {
    try {
        var admin = false;
        var user: User | undefined = undefined;

        if (req.headers.get("Authorization") != undefined) {
            const token = req.headers.get("Authorization")!.split(" ")[1] ?? "";
            const verified = verify(token);
            if (verified.ok) {
                user = await getUserByUUID(verified.payload!.uuid);

                admin = (user?.role ?? 0) >= 1;
            }
        }

        const response = await db.query(
            `
            SELECT boardType, display, OneGradeOnly, TwoGradeOnly, ThirdGradeOnly 
            FROM everytime.boards 
            WHERE deleted = 0 
            AND (@isAdmin = 1 OR admin = 0)`,
            {
                isAdmin: admin, //admin
            }
        );

        const boards: Board[] = [];
        boards.push({ boardType: "all", display: "전체" });
        for (var item of response.recordset) {
            if (user === undefined) {
                if (
                    Number(item.OneGradeOnly) +
                        Number(item.TwoGradeOnly) +
                        Number(item.ThirdGradeOnly) <
                    3
                )
                    continue;

                boards.push(item);
            } else {
                if (admin) {
                    boards.push(item);
                    continue;
                }
                const grade = user.grade;
                switch (grade) {
                    case 1:
                        if (item.OneGradeOnly == 1) {
                            boards.push(item);
                        }
                        break;
                    case 2:
                        if (item.TwoGradeOnly == 1) {
                            boards.push(item);
                        }
                        break;
                    case 3:
                        if (item.ThirdGradeOnly == 1) {
                            boards.push(item);
                        }
                        break;
                }
            }
        }
        return NextResponse.json(
            {
                message: "success",
                boards: boards,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {
                message: "Internal Server Error",
            },
            {
                status: 500,
            }
        );
    }
}
