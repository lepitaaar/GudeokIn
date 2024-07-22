import { verify } from "@/app/lib/jwtUtil";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const header = headers();
    const token = header.get("Authorization")?.split(" ")[1];

    const verified = await verify(token ?? "");
    if (verified.ok) {
        return NextResponse.json(
            {
                message: "verify success",
            },
            {
                status: 200,
            }
        );
    }
    return NextResponse.json(
        {
            message: "failed verify",
        },
        {
            status: 500,
        }
    );
}
