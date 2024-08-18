"use client";

import { useState } from "react";
import { useAuth } from "../../Provider/AuthProvider";
import { isAxiosError } from "axios";
import axios from "@/app/lib/axios";
import CryptoJS_neis from "./Crypto";
import moment from "moment";
import { useRouter } from "next/navigation";

export default function NeisSync() {
    const { isLoggedIn, user } = useAuth();
    const [isSync, setSync] = useState(user!.isNeisSync);
    const [isSetup, setSetup] = useState(false);
    const [userID, setUserID] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setLoading] = useState(false);
    const router = useRouter();

    const neisSync = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const enc = (CryptoJS_neis as any).AES.encrypt(
                password, // 평문
                "onepass987655432", // 비밀번호
                {
                    iv: 1234567812345678,
                    mode: (CryptoJS_neis as any).mode.CBC,
                    padding: (CryptoJS_neis as any).pad.Pkcs7,
                }
            );
            const syncReq = await axios.post(`/api/neis`, {
                username: userID,
                enc_password: enc.toString(),
            });

            if (syncReq.status === 200) {
                setSync(true);
                setErrorMsg("");
                router.refresh();
            }
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                setErrorMsg(error.response.data.message);
            } else {
                console.log(error);
            }
        }
        setLoading(false);
    };

    return (
        <>
            {isSync ? (
                <div
                    className="flex flex-col rounded-lg items-center justify-center p-4 cursor-pointer space-y-1"
                    style={{ boxShadow: "rgba(0, 0, 0, 0.3) 0px 1px 7px" }}
                >
                    <div className="flex flex-row items-center justify-center cursor-pointer">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            version="1.1"
                            id="레이어_1"
                            x="0px"
                            y="0px"
                            height={25}
                            viewBox="0 0 95 25"
                        >
                            <g>
                                <path d="M10.4,13.2l2.1,4.6h0.1c-0.1-1.1-0.2-2.3-0.4-3.6c-0.1-1.3-0.2-2.6-0.2-3.8V2h4V23h-4.3L5.8,11.8L3.6,7.2H3.5   c0.1,1.1,0.2,2.3,0.3,3.6C3.9,12.1,4,13.4,4,14.6V23H0V2h4.3L10.4,13.2z" />
                                <path d="M34.3,5.5h-8.7v4.9H33v3.5h-7.4v5.6h9V23H21.3V2h12.9V5.5z" />
                                <path d="M43.1,23h-4.2V2h4.2V23z" />
                                <path d="M50.4,22.6c-1.3-0.5-2.5-1.3-3.5-2.3l2.4-2.9c0.8,0.7,1.6,1.3,2.6,1.7c0.9,0.4,1.9,0.6,2.8,0.6c1.1,0,1.9-0.2,2.5-0.7   c0.6-0.4,0.9-1,0.9-1.8c0-0.4-0.1-0.7-0.2-1c-0.2-0.3-0.4-0.5-0.6-0.7c-0.3-0.2-0.6-0.4-1-0.6c-0.4-0.2-0.8-0.4-1.3-0.6L52,13.3   c-0.7-0.3-1.4-0.7-2.1-1.2c-0.6-0.5-1.2-1.1-1.6-1.8c-0.4-0.7-0.6-1.6-0.6-2.6c0-0.9,0.2-1.7,0.5-2.4c0.4-0.8,0.9-1.4,1.5-1.9   c0.6-0.5,1.4-1,2.3-1.3C53,1.7,54,1.6,55.1,1.6c1.3,0,2.5,0.2,3.6,0.7c1.1,0.5,2.2,1.1,3,2l-2.1,2.7c-0.7-0.6-1.4-1-2.1-1.3   c-0.7-0.3-1.5-0.5-2.4-0.5c-0.9,0-1.7,0.2-2.2,0.6C52.3,6.1,52,6.7,52,7.4c0,0.4,0.1,0.7,0.3,0.9c0.2,0.3,0.4,0.5,0.7,0.7   c0.3,0.2,0.6,0.4,1,0.6c0.4,0.2,0.8,0.4,1.3,0.5l2.8,1.2c1.3,0.5,2.3,1.2,3.1,2.1c0.8,0.9,1.1,2.1,1.1,3.6c0,0.9-0.2,1.7-0.5,2.5   c-0.4,0.8-0.9,1.5-1.5,2c-0.7,0.6-1.5,1-2.4,1.4c-1,0.3-2,0.5-3.3,0.5C53.1,23.4,51.8,23.2,50.4,22.6z" />
                                <path
                                    fill="#1060E1"
                                    d="M67.9,10.6h7.5V2.7h4v7.9h7.5v3.9h-7.5v7.9h-4v-7.9h-7.5V10.6z"
                                />
                            </g>
                        </svg>
                        <p className="text-lg font-semibold">연동완료</p>
                        <div className="bg-blue-500 rounded-full p-1 ms-1">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="18px"
                                viewBox="0 -960 960 960"
                                width="18px"
                                fill="#e8eaed"
                                onClick={() => {
                                    setSync(false);
                                    setSetup(true);
                                }}
                            >
                                <path d="M160-160v-80h110l-16-14q-52-46-73-105t-21-119q0-111 66.5-197.5T400-790v84q-72 26-116 88.5T240-478q0 45 17 87.5t53 78.5l10 10v-98h80v240H160Zm400-10v-84q72-26 116-88.5T720-482q0-45-17-87.5T650-648l-10-10v98h-80v-240h240v80H690l16 14q49 49 71.5 106.5T800-482q0 111-66.5 197.5T560-170Z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-sm">
                        업데이트 날짜 :{" "}
                        {moment(user?.neisSyncDate).format("YYYY-MM-DD")}
                    </p>
                </div>
            ) : (
                <div
                    className="flex flex-col cursor-pointer p-4 items-center justify-center rounded-lg space-y-3"
                    style={{ boxShadow: "rgba(0, 0, 0, 0.3) 0px 1px 7px" }}
                >
                    <div
                        className="flex flex-row items-center justify-center"
                        onClick={() => {
                            setSetup((prev) => !prev);
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            version="1.1"
                            id="레이어_1"
                            x="0px"
                            y="0px"
                            height={25}
                            viewBox="0 0 95 25"
                        >
                            <g>
                                <path d="M10.4,13.2l2.1,4.6h0.1c-0.1-1.1-0.2-2.3-0.4-3.6c-0.1-1.3-0.2-2.6-0.2-3.8V2h4V23h-4.3L5.8,11.8L3.6,7.2H3.5   c0.1,1.1,0.2,2.3,0.3,3.6C3.9,12.1,4,13.4,4,14.6V23H0V2h4.3L10.4,13.2z" />
                                <path d="M34.3,5.5h-8.7v4.9H33v3.5h-7.4v5.6h9V23H21.3V2h12.9V5.5z" />
                                <path d="M43.1,23h-4.2V2h4.2V23z" />
                                <path d="M50.4,22.6c-1.3-0.5-2.5-1.3-3.5-2.3l2.4-2.9c0.8,0.7,1.6,1.3,2.6,1.7c0.9,0.4,1.9,0.6,2.8,0.6c1.1,0,1.9-0.2,2.5-0.7   c0.6-0.4,0.9-1,0.9-1.8c0-0.4-0.1-0.7-0.2-1c-0.2-0.3-0.4-0.5-0.6-0.7c-0.3-0.2-0.6-0.4-1-0.6c-0.4-0.2-0.8-0.4-1.3-0.6L52,13.3   c-0.7-0.3-1.4-0.7-2.1-1.2c-0.6-0.5-1.2-1.1-1.6-1.8c-0.4-0.7-0.6-1.6-0.6-2.6c0-0.9,0.2-1.7,0.5-2.4c0.4-0.8,0.9-1.4,1.5-1.9   c0.6-0.5,1.4-1,2.3-1.3C53,1.7,54,1.6,55.1,1.6c1.3,0,2.5,0.2,3.6,0.7c1.1,0.5,2.2,1.1,3,2l-2.1,2.7c-0.7-0.6-1.4-1-2.1-1.3   c-0.7-0.3-1.5-0.5-2.4-0.5c-0.9,0-1.7,0.2-2.2,0.6C52.3,6.1,52,6.7,52,7.4c0,0.4,0.1,0.7,0.3,0.9c0.2,0.3,0.4,0.5,0.7,0.7   c0.3,0.2,0.6,0.4,1,0.6c0.4,0.2,0.8,0.4,1.3,0.5l2.8,1.2c1.3,0.5,2.3,1.2,3.1,2.1c0.8,0.9,1.1,2.1,1.1,3.6c0,0.9-0.2,1.7-0.5,2.5   c-0.4,0.8-0.9,1.5-1.5,2c-0.7,0.6-1.5,1-2.4,1.4c-1,0.3-2,0.5-3.3,0.5C53.1,23.4,51.8,23.2,50.4,22.6z" />
                                <path
                                    fill="#1060E1"
                                    d="M67.9,10.6h7.5V2.7h4v7.9h7.5v3.9h-7.5v7.9h-4v-7.9h-7.5V10.6z"
                                />
                            </g>
                        </svg>
                        <p className="text-lg font-semibold">연동하기</p>
                    </div>
                    {isSetup && (
                        <>
                            {isLoading ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 100 100"
                                    preserveAspectRatio="xMidYMid"
                                    width={50}
                                    height={50}
                                    style={{
                                        background: "transparent",
                                        display: "block",
                                        shapeRendering: "auto",
                                    }}
                                >
                                    <g>
                                        <circle
                                            strokeDasharray="164.93361431346415 56.97787143782138"
                                            r="35"
                                            strokeWidth="3"
                                            stroke="#3f68e7"
                                            fill="none"
                                            cy="50"
                                            cx="50"
                                        >
                                            <animateTransform
                                                keyTimes="0;1"
                                                values="0 50 50;360 50 50"
                                                dur="1s"
                                                repeatCount="indefinite"
                                                type="rotate"
                                                attributeName="transform"
                                            ></animateTransform>
                                        </circle>
                                        <g></g>
                                    </g>
                                </svg>
                            ) : (
                                <>
                                    <div className="w-full">
                                        <div className="flex flex-col gap-6 w-full mt-4">
                                            <div className="relative h-11 w-full min-w-[200px]">
                                                <input
                                                    placeholder="아이디"
                                                    id="userID"
                                                    value={userID}
                                                    onChange={(e) =>
                                                        setUserID(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="peer h-full w-full border-b border-blue-gray-200 bg-transparent pt-4 pb-1.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-gray-900 focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                                                    minLength={1}
                                                />
                                                <label
                                                    className="after:content[' '] pointer-events-none absolute left-0  -top-2.5 flex h-full w-full select-none !overflow-visible truncate text-sm font-normal leading-tight text-gray-500 transition-all after:absolute after:-bottom-2.5 after:block after:w-full after:scale-x-0 after:border-b-2 after:border-gray-500 after:transition-transform after:duration-300"
                                                    htmlFor="userID"
                                                >
                                                    아이디
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-6 w-full mt-4">
                                            <div className="relative h-11 w-full min-w-[200px]">
                                                <input
                                                    placeholder="비밀번호"
                                                    id="enc_password"
                                                    value={password}
                                                    onChange={(e) =>
                                                        setPassword(
                                                            e.target.value
                                                        )
                                                    }
                                                    type="password"
                                                    className="peer h-full w-full border-b border-blue-gray-200 bg-transparent pt-4 pb-1.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-gray-900 focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                                                    minLength={1}
                                                />
                                                <label
                                                    className="after:content[' '] pointer-events-none absolute left-0  -top-2.5 flex h-full w-full select-none !overflow-visible truncate text-sm font-normal leading-tight text-gray-500 transition-all after:absolute after:-bottom-2.5 after:block after:w-full after:scale-x-0 after:border-b-2 after:border-gray-500 after:transition-transform after:duration-300"
                                                    htmlFor="enc_password"
                                                >
                                                    패스워드
                                                </label>
                                            </div>
                                        </div>
                                        <p className="text-xs text-red-500">
                                            {errorMsg}
                                        </p>
                                    </div>
                                    <button
                                        onClick={neisSync}
                                        className="w-[55px] h-[37px] bg-blue-500 text-white font-semibold rounded-[0.2rem]"
                                    >
                                        연동
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </>
    );
}
