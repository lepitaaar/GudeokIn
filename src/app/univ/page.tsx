import React from "react";
import NavBarLayout from "../component/mobile/Header/NavBarLayout";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import WithSkeletonImage from "../component/common/WithSkeletonImage";

export const metadata: Metadata = {
    title: "대학 입시 정보",
};

export default function University() {
    return (
        <NavBarLayout>
            <div className="grid grid-cols-3 gap-4 place-content-stretch p-3">
                <Link
                    href="https://go.pusan.ac.kr/college_2016/main/main.asp"
                    target="_blank"
                    className="flex-1"
                >
                    <div className="flex flex-col border border-solid border-1 p-3 shadow-sm rounded-lg justify-center place-items-center space-y-2">
                        <WithSkeletonImage
                            src={`/pusan.png`}
                            alt="대학교"
                            width={300}
                            height={300}
                        />
                        <span className="text-x2 font-bold">부산대학교</span>
                    </div>
                </Link>
                <Link
                    href="https://iphak.pknu.ac.kr/pknu/index.htm"
                    target="_blank"
                    className="flex-1"
                >
                    <div className="flex flex-col border border-solid border-1 p-3 shadow-sm rounded-lg justify-center place-items-center space-y-2">
                        <WithSkeletonImage
                            src={`/pukyung.gif`}
                            alt="대학교"
                            width={300}
                            height={300}
                        />
                        <span className="text-x2 font-bold">부경대학교</span>
                    </div>
                </Link>
                <Link
                    href="https://ipsi.deu.ac.kr/main.do"
                    target="_blank"
                    className="flex-1"
                >
                    <div className="flex flex-col border border-solid border-1 p-3 shadow-sm rounded-lg justify-center place-items-center space-y-2">
                        <WithSkeletonImage
                            src={`/dong-eui.png`}
                            alt="대학교"
                            width={300}
                            height={300}
                        />
                        <span className="text-x2 font-bold">동의대학교</span>
                    </div>
                </Link>
                <Link
                    href="https://ent.donga.ac.kr/admission/html/main/main.asp"
                    target="_blank"
                    className="flex-1"
                >
                    <div className="flex flex-col border border-solid border-1 p-3 shadow-sm rounded-lg justify-center place-items-center space-y-2">
                        <WithSkeletonImage
                            src={`/dong-a.jpg`}
                            alt="대학교"
                            width={300}
                            height={300}
                        />
                        <span className="text-x2 font-bold">동아대학교</span>
                    </div>
                </Link>
                <Link
                    href="https://ipsi.dongseo.ac.kr/ipsi/"
                    target="_blank"
                    className="flex-1"
                >
                    <div className="flex flex-col border border-solid border-1 p-3 shadow-sm rounded-lg justify-center place-items-center space-y-2">
                        <WithSkeletonImage
                            src={`/dongseo.jpg`}
                            alt="대학교"
                            width={300}
                            height={300}
                        />
                        <span className="text-x2 font-bold">동서대학교</span>
                    </div>
                </Link>
                <Link
                    href="https://iphak.inje.ac.kr/cover.asp"
                    target="_blank"
                    className="flex-1"
                >
                    <div className="flex flex-col border border-solid border-1 p-3 shadow-sm rounded-lg justify-center place-items-center space-y-2">
                        <WithSkeletonImage
                            src={`/inje.jpg`}
                            alt="대학교"
                            width={300}
                            height={300}
                        />
                        <span className="text-x2 font-bold">인제대학교</span>
                    </div>
                </Link>
                <Link
                    href="https://ipsi1.knu.ac.kr/intro/"
                    target="_blank"
                    className="flex-1"
                >
                    <div className="flex flex-col border border-solid border-1 p-3 shadow-sm rounded-lg justify-center place-items-center space-y-2">
                        <WithSkeletonImage
                            src={`/kyungpook.png`}
                            alt="대학교"
                            width={300}
                            height={300}
                        />
                        <span className="text-x2 font-bold">경북대학교</span>
                    </div>
                </Link>
                <Link
                    href="https://admission.snu.ac.kr/"
                    target="_blank"
                    className="flex-1"
                >
                    <div className="flex flex-col border border-solid border-1 p-3 shadow-sm rounded-lg justify-center place-items-center space-y-2">
                        <WithSkeletonImage
                            src={`/seoul.png`}
                            alt="대학교"
                            width={300}
                            height={300}
                        />
                        <span className="text-x2 font-bold">서울대학교</span>
                    </div>
                </Link>
                <Link
                    href="https://oku.korea.ac.kr/oku/index.do"
                    target="_blank"
                    className="flex-1"
                >
                    <div className="flex flex-col border border-solid border-1 p-3 shadow-sm rounded-lg justify-center place-items-center space-y-2">
                        <WithSkeletonImage
                            src={`/korea.jpg`}
                            alt="대학교"
                            width={300}
                            height={300}
                        />
                        <span className="text-x2 font-bold">고려대학교</span>
                    </div>
                </Link>
                <Link
                    href="https://admission.yonsei.ac.kr/seoul/admission/html/main/main.asp"
                    target="_blank"
                    className="flex-1"
                >
                    <div className="flex flex-col border border-solid border-1 p-3 shadow-sm rounded-lg justify-center place-items-center space-y-2">
                        <WithSkeletonImage
                            src={`/yonsei.png`}
                            alt="대학교"
                            width={300}
                            height={300}
                        />
                        <span className="text-x2 font-bold">연세대학교</span>
                    </div>
                </Link>
            </div>

            <br />
            <hr />
            <br />
            <Link href="https://adiga.kr">
                <div className="border border-solid border-1 m-3 p-3 shadow-sm rounded-lg flex-1">
                    <span className="text-x2 font-bold">
                        대학어디가 사이트 바로가기
                    </span>
                </div>
            </Link>
        </NavBarLayout>
    );
}
