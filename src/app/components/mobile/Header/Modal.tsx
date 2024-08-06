"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface ModalProps {
    show: boolean;
    onClose: () => void;
    onLogin: (credentials: { username: string; password: string }) => void;
}

export default function LoginModal({ show, onClose, onLogin }: ModalProps) {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isRemeber, setRemeber] = useState<boolean>(false);

    useEffect(() => {
        const bool = Boolean(localStorage.getItem("isRemeber") ?? "0");
        setRemeber(bool);
        if (bool) {
            setUsername(localStorage.getItem("username") ?? "");
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("isRemeber", String(isRemeber));
    }, [isRemeber]);

    if (!show) {
        return null;
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isRemeber) {
            localStorage.setItem("username", username);
        }
        onLogin({ username, password });
        setPassword("");
    };

    return (
        <div
            className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow relative z-20"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-end p-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                        data-modal-toggle="authentication-modal"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                    </button>
                </div>
                <form
                    className="space-y-4 px-6 lg:px-8 pb-4 sm:pb-6 xl:pb-8"
                    onSubmit={handleSubmit}
                >
                    <h3 className="text-xl font-medium text-gray-900">
                        구덕인 로그인
                    </h3>
                    <div>
                        <label
                            form="text"
                            className="text-sm font-medium text-gray-900 block mb-2"
                        >
                            아이디
                        </label>
                        <input
                            type="text"
                            name="email"
                            id="email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="gudeok"
                            required
                        />
                    </div>
                    <div>
                        <label
                            form="password"
                            className="text-sm font-medium text-gray-900 block mb-2"
                        >
                            비밀번호
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="••••••••"
                            autoComplete="off"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            required
                        />
                    </div>
                    <div className="flex justify-between">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="remember"
                                    aria-describedby="remember"
                                    type="checkbox"
                                    checked={isRemeber}
                                    onChange={(e) =>
                                        setRemeber(e.target.checked)
                                    }
                                    className="bg-gray-50 border border-gray-300 focus:ring-3 focus:ring-blue-300 h-4 w-4 rounded"
                                />
                            </div>
                            <div className="text-sm ml-3">
                                <label
                                    form="remember"
                                    htmlFor="remember"
                                    className="font-medium text-gray-900"
                                >
                                    아이디 저장
                                </label>
                            </div>
                        </div>
                        <Link
                            href={"/register"}
                            className="text-sm text-blue-700 hover:underline"
                        >
                            회원가입
                        </Link>
                    </div>
                    <button
                        type="submit"
                        className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    >
                        로그인
                    </button>
                </form>
            </div>
        </div>
    );
}
