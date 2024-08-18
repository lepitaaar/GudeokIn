"use client";

import { DayOfMeal, Row } from "@/app/meal/page";
import React, { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

import "./carousel.css";
import moment from "moment";

import { EffectCoverflow, Navigation } from "swiper/modules";

interface CarouselProps {
    items: { [key: string]: DayOfMeal[] };
}

const MobileMealCarousel: React.FC<CarouselProps> = ({ items }) => {
    const dayOfweek = moment().isoWeekday();
    const [isDinner, setDinner] = useState(false);

    return (
        <div className="container">
            <Swiper
                effect={"coverflow"}
                grabCursor={true}
                centeredSlides={true}
                loop={true}
                slidesPerView={"auto"}
                coverflowEffect={{
                    rotate: 0,
                    stretch: 0,
                    depth: 100,
                    modifier: 2,
                    slideShadows: false, // Disable slide shadows
                }}
                initialSlide={dayOfweek - 1}
                navigation={true}
                modules={[EffectCoverflow, Navigation]}
                className="swiper_container"
            >
                {["월", "화", "수", "목", "금"].map((day, index) => {
                    const meal = isDinner ? items[day][1] : items[day][0];
                    return (
                        <SwiperSlide key={index}>
                            <p className="text-2xl font-semibold text-center mb-2">
                                {day}
                            </p>
                            <div className="swiper-slide-content">
                                {meal?.menu ? (
                                    <>
                                        <div className="cal w-full flex items-center justify-center relative min-h-[40px] bg-blue-100 text-sm px-4">
                                            <div className="absolute right-2 flex-shrink-0">
                                                <label className="flex cursor-pointer select-none items-center">
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            checked={isDinner}
                                                            onChange={() => {
                                                                setDinner(
                                                                    (prev) =>
                                                                        !prev
                                                                );
                                                            }}
                                                            className="sr-only"
                                                        />
                                                        <div
                                                            className={`block h-8 w-14 rounded-full bg-white`}
                                                            style={{
                                                                boxShadow:
                                                                    "inset 0px 0px 4px rgba(0, 0, 0, 0.3)",
                                                            }}
                                                        ></div>
                                                        <div
                                                            className={`dot absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full transition ${
                                                                isDinner
                                                                    ? "translate-x-full"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <span
                                                                className={
                                                                    isDinner
                                                                        ? "active"
                                                                        : "inactive"
                                                                }
                                                            >
                                                                {isDinner ? (
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        height="20px"
                                                                        viewBox="0 -960 960 960"
                                                                        width="20px"
                                                                        fill="#2854C5"
                                                                    >
                                                                        <path d="M484-80q-84 0-157.5-32t-128-86.5Q144-253 112-326.5T80-484q0-128 72-232t193-146q22-8 41 5.5t18 36.5q-3 85 27 162t90 137q60 60 137 90t162 27q26-1 38.5 17.5T863-345q-44 120-147.5 192.5T484-80Zm0-80q88 0 163-44t118-121q-86-8-163-43.5T464-465q-61-61-97-138t-43-163q-77 43-120.5 118.5T160-484q0 135 94.5 229.5T484-160Zm-20-305Z" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        height="20px"
                                                                        viewBox="0 -960 960 960"
                                                                        width="20px"
                                                                        fill="#2854C5"
                                                                    >
                                                                        <path d="M480-760q-17 0-28.5-11.5T440-800v-80q0-17 11.5-28.5T480-920q17 0 28.5 11.5T520-880v80q0 17-11.5 28.5T480-760Zm198 82q-11-11-11-27.5t11-28.5l56-57q12-12 28.5-12t28.5 12q11 11 11 28t-11 28l-57 57q-11 11-28 11t-28-11Zm122 238q-17 0-28.5-11.5T760-480q0-17 11.5-28.5T800-520h80q17 0 28.5 11.5T920-480q0 17-11.5 28.5T880-440h-80ZM480-40q-17 0-28.5-11.5T440-80v-80q0-17 11.5-28.5T480-200q17 0 28.5 11.5T520-160v80q0 17-11.5 28.5T480-40ZM226-678l-57-56q-12-12-12-29t12-28q11-11 28-11t28 11l57 57q11 11 11 28t-11 28q-12 11-28 11t-28-11Zm508 509-56-57q-11-12-11-28.5t11-27.5q11-11 27.5-11t28.5 11l57 56q12 11 11.5 28T791-169q-12 12-29 12t-28-12ZM80-440q-17 0-28.5-11.5T40-480q0-17 11.5-28.5T80-520h80q17 0 28.5 11.5T200-480q0 17-11.5 28.5T160-440H80Zm89 271q-11-11-11-28t11-28l57-57q11-11 27.5-11t28.5 11q12 12 12 28.5T282-225l-56 56q-12 12-29 12t-28-12Zm311-71q-100 0-170-70t-70-170q0-100 70-170t170-70q100 0 170 70t70 170q0 100-70 170t-170 70Zm0-80q66 0 113-47t47-113q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-160Z" />
                                                                    </svg>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>

                                            <div className="text-center flex-grow">
                                                {meal.menu.cal}
                                            </div>
                                        </div>
                                        <div className="h-full w-full items-center flex justify-center p-4">
                                            <div
                                                className="text-center text-base leading-snug"
                                                dangerouslySetInnerHTML={{
                                                    __html: String(
                                                        meal.menu.DDISH_NM
                                                    )
                                                        .replace(
                                                            /\(\d+(\.\d+)*\)/g,
                                                            ""
                                                        )
                                                        .trim(),
                                                }}
                                            ></div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex w-full h-full justify-center items-center text-base">
                                        <p>급식 정보가 존재하지 않습니다</p>
                                    </div>
                                )}
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default MobileMealCarousel;
