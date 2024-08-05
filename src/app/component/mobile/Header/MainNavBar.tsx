"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import LoginModal from "./Modal";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import axios from "@/app/lib/axios";
import { isAxiosError } from "axios";
import useFcmToken from "@/app/hooks/useFcmToken";

interface Credentials {
    username: string;
    password: string;
}

interface LoginDTO {
    message: string;
    accessToken: string;
    refreshToken: string;
}

export default function MobileMainNavBar({
    menu,
    account,
    loginModal = false,
}: {
    menu: boolean;
    account: boolean;
    loginModal?: boolean;
}) {
    const [isOpen, setIsOpen] = useState<Boolean>(false);
    const [showModal, setShowModal] = useState(loginModal);
    const [isLogin, setLogin] = useState(false);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const { token, notificationPermissionStatus } = useFcmToken();
    const router = useRouter();

    useEffect(() => {
        const checkMe = async () => {
            try {
                await axios.get(`/api/auth/me`);
                setLogin(true);
            } catch (error) {
                setLogin(false);
            }
        };
        checkMe();
    }, []);

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

            setShowDropdown(false);
            setShowModal(false);
            setLogin(true);
            router.refresh();
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                alert(error.response.data.message);
            } else {
                console.error("Error during login:", error);
                errorMessage = "예상치 못한 오류가 발생했습니다";
            }
        } finally {
            if (errorMessage.length != 0) {
                window.alert(errorMessage);
            }
        }
    };

    const handleLogout = () => {
        // Clear tokens and update login state
        deleteCookie("accessToken");
        deleteCookie("refreshToken");
        setLogin(false);
        setShowDropdown(false);
        router.refresh();
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const toggleDropdown = () => {
        if (!isLogin) {
            setShowModal(true);
        } else {
            setShowDropdown(!showDropdown);
        }
    };

    return (
        <>
            <LoginModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onLogin={handleLogin}
            />

            <nav className="border border-none z-10 w-full h-[56px] shadow">
                <ul className="flex flex-row items-center justify-center h-full w-full">
                    <li className="flex-1 ml-3">
                        {menu && (
                            <svg
                                onClick={toggleMenu}
                                color="#2b2b2b"
                                className="w-[24px] h-[24px] block fill-current cursor-pointer"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                            </svg>
                        )}
                    </li>
                    <li className="flex-1 text-center">
                        <Link href={"/"}>
                            <p className="font-semibold text-lg">구덕인(人)</p>
                        </Link>
                    </li>
                    <li className="flex-1 mr-3 flex justify-end relative">
                        {account && (
                            <>
                                <svg
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                    height={24}
                                    width={24}
                                    className="cursor-pointer"
                                    onClick={toggleDropdown}
                                >
                                    <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm2-3a2 2 0 11-4 0 2 2 0 014 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                                </svg>
                                {showDropdown && (
                                    <div className="absolute right-0 mt-7 w-48 bg-white border rounded shadow-lg z-50">
                                        {isLogin && (
                                            <>
                                                <Link href={"/account"}>
                                                    <p className="p-4 border-b">
                                                        정보
                                                    </p>
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left p-4"
                                                >
                                                    로그아웃
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </li>
                </ul>
            </nav>

            <div
                className={`fixed top-0 left-0 w-64 h-full z-30 bg-white shadow-lg transform ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } transition-transform duration-300 ease-in-out`}
            >
                <div className="w-full h-[56px] flex justify-start items-center p-3">
                    <svg
                        onClick={toggleMenu}
                        color="#2b2b2b"
                        className="w-6 h-6 cursor-pointer"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                </div>
                <ul>
                    <Link href={"/community?board=all"} onClick={toggleMenu}>
                        <li className="p-4 border-b">커뮤니티</li>
                    </Link>
                    <Link href={"/meal"} onClick={toggleMenu}>
                        <li className="p-4 border-b">급식</li>
                    </Link>
                    <Link href={"/schedule"} onClick={toggleMenu}>
                        <li className="p-4 border-b">시간표</li>
                    </Link>
                    <Link href={"/diary"} onClick={toggleMenu}>
                        <li className="p-4 border-b">일정 관리</li>
                    </Link>
                    {/* ~ */}
                    {/* <Link href={"/stcard"} onClick={toggleMenu}>
                        <li className="p-4 border-b">학생증</li>
                    </Link> */}
                    {/* <Link href={"/self-study"} onClick={toggleMenu}>
                        <li className="p-4 border-b">야자</li>
                    </Link> */}
                    <Link href={"/univ"} onClick={toggleMenu}>
                        <li className="p-4 border-b">대학 정보</li>
                    </Link>
                </ul>
            </div>

            {isOpen && (
                <div
                    onClick={toggleMenu}
                    className="fixed inset-0 bg-black opacity-50 z-20"
                ></div>
            )}
        </>
    );
}
