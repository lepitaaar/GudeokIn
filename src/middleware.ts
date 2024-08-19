import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT, errors, jwtDecrypt, decodeJwt } from "jose";
import { JWTpayload } from "./app/export/DTO";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

const secret = process.env.RSA_PRIVATE_KEY!;

export async function verifyToken(token: RequestCookie) {
    try {
        await jwtVerify(token.value, new TextEncoder().encode(secret));
        return { ok: true, error: false };
    } catch (error) {
        if (error instanceof errors.JWTExpired) {
            return { ok: false, error: false };
        }
        return { ok: false, error: true };
    }
}

export async function verifyTokenWithString(token: string) {
    try {
        await jwtVerify(token, new TextEncoder().encode(secret));
        return { ok: true, error: false };
    } catch (error) {
        if (error instanceof errors.JWTExpired) {
            return { ok: false, error: false };
        }
        return { ok: false, error: true };
    }
}

export default async function middleware(req: NextRequest) {
    const cookieStore = req.cookies;
    const token = cookieStore.get("accessToken");
    const refreshToken = cookieStore.get("refreshToken");
    const secretKey = new TextEncoder().encode(secret);
    const pathname = req.nextUrl.pathname;
    const method = req.method;

    /** api middleware
     * 유저 토큰 검증 미들웨어
     */
    if (pathname.startsWith("/api") && method == "POST") {
        /** 토큰검증 예외 */
        if (
            [
                "/api/auth/login",
                "/api/auth/setup",
                "/api/auth/refresh",
                "/api/auth/register",
                "/api/auth/emailVerify",
                "/diary",
            ].includes(pathname)
        ) {
            return NextResponse.next();
        }
        const header = req.headers.get("Authorization");

        if (header == undefined) {
            return NextResponse.json(
                { message: "로그인이 필요합니다" },
                { status: 400 }
            );
        }

        const header_token = header.split(" ")[1];
        try {
            await jwtVerify<JWTpayload>(header_token, secretKey);
            return NextResponse.next();
        } catch (error) {
            if (error instanceof errors.JWTExpired) {
                return NextResponse.json(
                    {
                        message: "token expired",
                    },
                    {
                        status: 401,
                    }
                );
            }
            console.log(error);
        }
    }

    /** 권한없으면 메인으로 리다이렉트 */
    if (
        token === undefined &&
        ["/write", "/stcard", "/schedule", "/add_diary", "/modify"].some(
            (path) => pathname.startsWith(path)
        )
    ) {
        const redirect = NextResponse.redirect(
            new URL(
                encodeURI("/?alert=로그인 후 이용가능한 서비스 입니다"),
                req.url
            )
        );
        return redirect;
    }

    /** refresh middleware */
    if (token != undefined) {
        const isTokenValid = await verifyToken(token);
        const res = NextResponse.next();

        /**
         * try {
            const user = await jwtVerify<JWTpayload>(header_token, secretKey);
            await getUserByUUID(user.uuid);
        } catch (error) {
            const redirect = NextResponse.redirect(new URL("/", req.url));
            console.log("Not Found User: ", error.message);
            redirect.cookies.delete("accessToken");
            redirect.cookies.delete("refreshToken");
            return redirect;
        }
         */

        if (isTokenValid.ok) {
            return res;
        }

        if (isTokenValid.error) {
            res.cookies.delete("accessToken");
            res.cookies.delete("refreshToken");
            return res;
        }

        if (refreshToken === undefined) {
            res.cookies.delete("accessToken");
            res.cookies.delete("refreshToken");
            return res;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_HOST}/api/auth/refresh`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token.value}`,
                    },
                    body: JSON.stringify({
                        refreshToken: refreshToken.value,
                    }),
                }
            ).then((res) => res.json());
            console.log(response);
            res.cookies.set("accessToken", response.accessToken, {
                path: "/",
                maxAge: 60 * 60 * 24 * 14,
            });
            res.cookies.set("refreshToken", response.refreshToken, {
                path: "/",
                maxAge: 60 * 60 * 24 * 14,
            });
            return res;
        } catch (error: any) {
            const redirect = NextResponse.redirect(new URL("/", req.url));
            console.log("Middleware token refresh Error: ", error.message);
            redirect.cookies.delete("accessToken");
            redirect.cookies.delete("refreshToken");
            return redirect;
        }
    }

    if (pathname.startsWith("/board")) {
        const routes = pathname.replace("/board/", "").split("/");
        if (routes.length != 2) {
            return NextResponse.redirect(
                new URL("/?alert=존재 하지않은 개시판입니다", req.url)
            );
        }

        const [firstSegment, secondSegment] = routes;
        if (typeof firstSegment !== "string" || isNaN(Number(secondSegment))) {
            return NextResponse.redirect(
                new URL("/?alert=존재 하지않은 개시판입니다", req.url)
            );
        }
    }

    // if (pathname.startsWith("/modify")) {
    //     /** 토큰검증은 위에서 끝내서 검증필요없음 */
    //     try {
    //         /** /edit/post_id */
    //         const post_id = parseInt(pathname.replace("/modify/", ""));
    //         const payload = await jwtVerify<JWTpayload>(
    //             token!.value,
    //             secretKey
    //         );
    //         const result = await db.query(
    //             `SELECT uuid from everytime.user_info`
    //         );

    //         // if (result.recordset.length > 0) {
    //         //     return NextResponse.next();
    //         // }

    //         return NextResponse.redirect(
    //             new URL("/?alert=비정상적인 접근", req.url)
    //         );
    //     } catch (error) {
    //         return NextResponse.redirect(
    //             new URL("/?alert=존재 하지않은 게시물입니다", req.url)
    //         );
    //     }
    // }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|healthy|_next/image|favicon.ico).*)"],
};
