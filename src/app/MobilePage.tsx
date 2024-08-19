"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import moment from "moment";
import LoginModal from "./components/mobile/Header/Modal";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "@/app/lib/axios";
import "moment/locale/ko";
import BettingComponent from "./components/common/Betting/BettingComponent";
import BettingAdmin from "./components/common/Betting/BettingAdmin";
import WithSkeletonImage from "./components/common/WithSkeletonImage";
import useFcmToken from "@/app/hooks/useFcmToken";
import { fetchToken } from "./lib/firebase";
import { useAuth } from "./components/Provider/AuthProvider";
import NeisSync from "./components/mobile/Account/NeisSync";

function dday() {
    const today = new Date();

    // 수능이 열리는 연도 구하기
    let year = today.getFullYear();
    let month = 11; // 11월
    let dayOfWeek = 4; // 목요일

    // 현재 월과 11월의 차이 계산
    let monthDiff = month - (today.getMonth() + 1);
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() > 14)) {
        year++; // 이미 11월 둘째주가 지난 경우 다음 연도로 넘김
    }

    // 수능 시험 날짜 계산
    let suneungDate = new Date(year, month - 1, 14); // 11월 둘째주 목요일

    // 현재 날짜와 수능 시험 날짜 사이의 일수 계산
    let timeDiff = suneungDate.getTime() - today.getTime();
    let daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)); // milliseconds to days

    return daysDiff;
}

interface Credentials {
    username: string;
    password: string;
}

interface LoginDTO {
    message: string;
    accessToken: string;
    refreshToken: string;
}
async function getNotificationPermissionAndToken() {
    if (!("Notification" in window)) {
        console.info("This browser does not support desktop notification");
        return null;
    }

    // Step 2: Check if permission is already granted.
    if (Notification.permission === "granted") {
        return await fetchToken();
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            return await fetchToken();
        }
    }

    console.log("Notification permission not granted.");
    return null;
}
export default function MobilePage({
    schedule,
    lunch,
    dinner,
}: {
    schedule: any[];
    lunch: string;
    dinner: string;
}) {
    const { token, notificationPermissionStatus } = useFcmToken();
    const { isLoggedIn, user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [alertMessage, setAlertMessage] = useState(
        searchParams?.get("alert")
    );
    const [redirectLocation, setRedirectLocation] = useState(
        searchParams?.get("redirect")
    );

    useEffect(() => {
        if (alertMessage) {
            alert(alertMessage);
            setAlertMessage(null);
            router.push("/");
        }
        if (redirectLocation) {
            router.replace("/");
            router.push(redirectLocation);
            setRedirectLocation(null);
        }
    }, []);

    useEffect(() => {
        async function getToken() {
            if (!token) return;
            try {
                await axios.post(`/api/auth/me`, {
                    fcm: token,
                });
            } catch (error) {
                console.log(`Token Saved Error: ${error}`);
            }
        }
        getToken();
    }, [token]);

    const handleLogin = async (credentials: Credentials) => {
        //null check credentials
        let errorMessage = "";
        try {
            const response = await fetch(
                `/api/auth/login?id=${credentials.username}&pw=${credentials.password}&fcm=${token}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorData: LoginDTO = await response.json();
                errorMessage = errorData.message || "로그인 실패";
                return;
            }

            const data: LoginDTO = await response.json();

            setCookie("accessToken", data.accessToken, {
                path: "/",
                maxAge: 60 * 60 * 24 * 14,
            });
            setCookie("refreshToken", data.refreshToken, {
                path: "/",
                maxAge: 60 * 60 * 24 * 14,
                // httpOnly: true,
            });

            setShowModal(false);
            router.refresh();
        } catch (error) {
            console.error("Error during login:", error);
            errorMessage = "예상치 못한 오류가 발생했습니다";
        } finally {
            if (errorMessage.length != 0) {
                window.alert(errorMessage);
            }
        }
    };
    return (
        <>
            <LoginModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onLogin={handleLogin}
            />

            <main className="flex flex-col space-y-3 mt-3 mx-3 mb-8">
                <div className="helloCard border border-solid rounded-lg p-3 border-1 border-neutral-300 shadow-sm cursor-pointer">
                    {user ? (
                        <p
                            className="text-lg"
                            onClick={() => {
                                router.push(`/account`);
                            }}
                        >
                            안녕하세요{" "}
                            <span className="text-blue-600 font-bold">
                                {user.nickname}
                            </span>
                            님!
                        </p>
                    ) : (
                        <p
                            className="text-lg"
                            onClick={() => setShowModal(true)}
                        >
                            <span className="text-blue-600 font-bold">
                                로그인
                            </span>
                            이 필요합니다
                        </p>
                    )}
                </div>
                <div className="todayBob">
                    <div className="flex flex-row space-x-3">
                        <Link
                            href={"/meal"}
                            className="border border-1 shadow-sm rounded-lg space-y-2 flex-1 p-4 min-h-40"
                        >
                            <div>
                                <div className="header flex flex-row justify-between">
                                    <span className="font-bold text-xl text-blue-600">
                                        중식
                                    </span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        width="24"
                                        height="24"
                                    >
                                        <path d="M10 6l-1.41 1.41L13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
                                    </svg>
                                </div>
                                <p
                                    className="menu"
                                    dangerouslySetInnerHTML={{
                                        __html: lunch,
                                    }}
                                />
                            </div>
                        </Link>
                        <Link
                            href={"/meal"}
                            className="border border-1 shadow-sm rounded-lg space-y-2 flex-1 p-4 min-h-40"
                        >
                            <div>
                                <div className="header flex flex-row justify-between">
                                    <span className="font-bold text-xl text-blue-600">
                                        석식
                                    </span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        width="24"
                                        height="24"
                                    >
                                        <path d="M10 6l-1.41 1.41L13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
                                    </svg>
                                </div>
                                <p
                                    className="menu"
                                    dangerouslySetInnerHTML={{
                                        __html: dinner,
                                    }}
                                />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* {(user?.role ?? 0) >= 2 && <BettingAdmin />} */}

                {/* <BettingComponent /> */}

                {schedule.length > 0 && (
                    <Link href={"/diary"}>
                        <div className="Sooneung-Counter border border-1 p-3 shadow-sm rounded-lg space-y-2">
                            <p className="text-lg font-bold">일정</p>
                            <div className="overflow-x-auto scrollbar-hide">
                                <div className="flex space-x-4">
                                    {schedule.map((ele, index) => (
                                        <div
                                            key={index}
                                            className="border rounded-lg border-blue-600 p-4 w-44 h-28 flex-shrink-0"
                                        >
                                            <p className="font-semibold text-blue-600 text-base">
                                                {moment(ele.AA_YMD).format(
                                                    "MM월 DD일(ddd)"
                                                )}
                                            </p>
                                            <div className="overflow-hidden h-16">
                                                {ele.EVENTS.map(
                                                    (
                                                        event: any,
                                                        idx: number
                                                    ) => {
                                                        if (idx < 2) {
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className="text-sm flex flex-row mt-1"
                                                                >
                                                                    <div className="w-1 bg-green-400"></div>
                                                                    <p className="flex-1 ml-2 overflow-hidden text-ellipsis whitespace-nowrap">
                                                                        {
                                                                            event.EVENT_NM
                                                                        }
                                                                    </p>
                                                                    {event.period && (
                                                                        <p className="text-gray-500">
                                                                            {event.period
                                                                                .split(
                                                                                    "~"
                                                                                )[0]
                                                                                .trim()}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            );
                                                        } else {
                                                            return null;
                                                        }
                                                    }
                                                )}
                                                {/**{ele.EVENTS.length > 2 && (
                                            <p className="text-gray-500 mt-1 text-right">
                                                ...
                                            </p>
                                        )} */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Link>
                )}

                {/* <div
                    className="border border-solid border-1 p-3 shadow-sm rounded-lg cursor-pointer"
                    onClick={() => {
                        router.push(`/gift`);
                    }}
                >
                    <p className="text-xl font-bold">
                        E-Sports{" "}
                        <span className="text-blue-600">경품 당첨자</span>{" "}
                        확인하기 👉
                    </p>
                </div> */}
                {isLoggedIn && (
                    <div>
                        <NeisSync />
                        <p className="text-xs text-gray-600 mt-1">
                            나이스 성적 계산은 학기말 기준으로 제공됩니다
                        </p>
                    </div>
                )}
                <div className="Sooneung-Counter border border-solid border-1 p-3 shadow-sm rounded-lg">
                    <p className="text-xl font-bold">
                        대학수학능력시험{" "}
                        <span className="text-blue-600">D-{dday()}</span>
                    </p>
                </div>

                <div className="flex flex-row justify-around items-center rounded-lg py-2">
                    <Link href={`https://adiga.kr`} target={"_blank"}>
                        <div className="flex flex-col justify-center items-center">
                            <WithSkeletonImage
                                src={"/adiga_logo.png"}
                                className="w-12 h-12 object-contain"
                                width={112}
                                height={48}
                                alt="어디가 이미지"
                            />
                            <p>어디가</p>
                        </div>
                    </Link>

                    <Link
                        href={`https://go.pusan.ac.kr/college_2016/main/main.asp`}
                        target={"_blank"}
                    >
                        <div className="flex flex-col justify-center items-center">
                            <WithSkeletonImage
                                src={"/pusan.png"}
                                className="w-12 h-12"
                                width={1049}
                                height={1044}
                                alt="부산대 이미지"
                            />
                            <p>부산대</p>
                        </div>
                    </Link>

                    <Link
                        href={`https://iphak.pknu.ac.kr/pknu/index.htm`}
                        target={"_blank"}
                    >
                        <div className="flex flex-col justify-center items-center">
                            <WithSkeletonImage
                                src={"/pukyung.gif"}
                                className="w-12 h-12"
                                width={504}
                                height={512}
                                alt="부경대 이미지"
                            />
                            <p>부경대</p>
                        </div>
                    </Link>

                    <Link
                        href={`https://ent.donga.ac.kr/admission/html/main/main.asp`}
                        target={"_blank"}
                    >
                        <div className="flex flex-col justify-center items-center">
                            <WithSkeletonImage
                                src={"/dong-a.jpg"}
                                className="w-12 h-12"
                                width={400}
                                height={400}
                                alt="동아대 이미지"
                            />
                            <p>동아대</p>
                        </div>
                    </Link>

                    <Link
                        href={`https://ipsi.deu.ac.kr/main.do`}
                        target={"_blank"}
                    >
                        <div className="flex flex-col justify-center items-center">
                            <WithSkeletonImage
                                src={"/dong-eui.png"}
                                className="w-12 h-12"
                                width={250}
                                height={250}
                                alt="동의대 이미지"
                            />
                            <p>동의대</p>
                        </div>
                    </Link>
                </div>

                <div className="flex space-x-3">
                    <Link
                        href="https://music.gudeok.kr/"
                        target="_blank"
                        className="flex-1"
                    >
                        <div className="border border-solid border-1 p-3 bg-blue-600 shadow-sm rounded-lg">
                            <span className="text-x2 font-bold text-gray-50">
                                청소시간 노래 신청하러 가기 👉
                            </span>
                        </div>
                    </Link>
                    {/* <div className="border border-solid border-1 p-3 shadow-sm rounded-lg flex-1">
                    <a className="text-x2 font-bold">건의함</a>
                </div> */}
                </div>
            </main>
        </>
    );
}
