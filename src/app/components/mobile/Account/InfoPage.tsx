"use client";

import { User } from "@/app/export/DTO";
import axios from "@/app/lib/axios";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import React, { useRef, useState } from "react";

export default function InfoPage({ user }: { user: User }) {
    const profileImgRef = useRef<any>();
    const [isBlurred, setIsBlurred] = useState(true);
    const [nickname, setNickname] = useState(user.nickname);
    const [imgSrc, setImageSrc] = useState(user.profileImage);
    const [profileImg, setProfileImg] = useState<Blob | undefined>(undefined);
    const [isPostAlarm, setPostAlarm] = useState<Boolean>(user.isCmAr == true);
    const handleToggleBlur = () => {
        setIsBlurred(!isBlurred);
    };
    const router = useRouter();

    const ChangeProfileImage = async () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();
        input.addEventListener("change", async () => {
            if (input.files === undefined || input.files?.length == 0) return;
            const file = input.files![0];
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = () => {
                setImageSrc(reader.result as string);
                setProfileImg(file);
            };
        });
    };

    const modifyProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                `/api/account`,
                {
                    nickname: nickname,
                    profile: profileImg,
                    postAlarm: isPostAlarm,
                },
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            if (res.status === 200) {
                router.refresh();
                setProfileImg(undefined);
            }
            if (res.status === 202) {
                alert(res.data.message);
            }
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                alert(error.response.data.message);
            } else {
                console.log(error);
            }
        }
    };

    return (
        <div className="pr-4 pl-4 pt-4">
            <form onSubmit={modifyProfile}>
                <div className="profile flex flex-col relative justify-center items-center">
                    <div className="relative w-[130px] h-[130px] cursor-pointer">
                        <img
                            ref={profileImgRef}
                            src={imgSrc}
                            className="w-full h-full rounded-full object-cover"
                            alt="프로필 이미지"
                        />
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300"
                            onClick={ChangeProfileImage}
                        >
                            <span className="text-white text-xl font-bold">
                                +
                            </span>
                        </div>
                    </div>
                    <p className="mt-2 text-xl font-semibold">
                        {user.nickname}
                    </p>
                    <p>
                        {user.grade}학년 {user.class}반 {user.number}번
                    </p>
                    {user.credit && (
                        <p>
                            등급 :{" "}
                            <span
                                className="cursor-pointer"
                                style={isBlurred ? { filter: "blur(4px)" } : {}}
                                onClick={handleToggleBlur}
                            >
                                {user.credit}
                            </span>
                        </p>
                    )}
                </div>
                <div className="space-y-3">
                    <div className="flex flex-col gap-6 w-full mt-4">
                        <div className="relative h-11 w-full min-w-[200px]">
                            <input
                                placeholder="닉네임"
                                id="nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="peer h-full w-full border-b border-blue-gray-200 bg-transparent pt-4 pb-1.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-gray-900 focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                                maxLength={20}
                            />
                            <label
                                className="after:content[' '] pointer-events-none absolute left-0  -top-2.5 flex h-full w-full select-none !overflow-visible truncate text-sm font-normal leading-tight text-gray-500 transition-all after:absolute after:-bottom-2.5 after:block after:w-full after:scale-x-0 after:border-b-2 after:border-gray-500 after:transition-transform after:duration-300"
                                htmlFor="nickname"
                            >
                                닉네임
                            </label>
                        </div>
                    </div>
                    <div className="flex flex-row justify-between">
                        <p>글 등록 알림</p>
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={Boolean(isPostAlarm)}
                                onChange={() => {
                                    setPostAlarm((prev) => !prev);
                                }}
                                className="sr-only peer"
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="flex justify-center items-center">
                        <button
                            type="submit"
                            className="w-[55px] h-[37px] bg-blue-500 text-white font-semibold rounded-[0.2rem]"
                        >
                            저장
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
