"use client";

import { DayOfMeal, Row } from "@/app/meal/page";
import React, { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

import "./carousel.css";
import styles from "./MealCarousel.module.css";
import moment from "moment";

import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";

interface CarouselProps {
    items: { [key: string]: DayOfMeal[] };
}

const MobileMealCarousel: React.FC<CarouselProps> = ({ items }) => {
    const dayOfweek = moment().isoWeekday();
    return (
        <div className={styles.container}>
            <div className="container text-4xl">
                <Swiper
                    effect={"coverflow"}
                    grabCursor={true}
                    centeredSlides={true}
                    loop={true}
                    slidesPerView={"auto"}
                    coverflowEffect={{
                        rotate: 0,
                        stretch: -15,
                        depth: 50,
                        modifier: 2.5,
                    }}
                    initialSlide={dayOfweek - 1}
                    pagination={{ el: ".swiper-pagination", clickable: true }}
                    navigation={{
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",

                        //clickable: true,
                    }}
                    modules={[EffectCoverflow, Pagination, Navigation]}
                    className="swiper_container"
                >
                    {["월", "화", "수", "목", "금"].map((day, index) => {
                        const lunch = items[day][0];
                        return (
                            <SwiperSlide key={index}>
                                <p className="text-5xl font-semibold text-center mb-3">
                                    {day}
                                </p>
                                <div
                                    className={`bg-white border-blue-600 border-4 w-full h-full rounded-[40px] flex items-center justify-start text-black text-4xl flex-col flex-grow overflow-hidden`}
                                >
                                    {lunch?.menu ? (
                                        <>
                                            <div className="cal w-full items-center justify-center flex min-h-[60px]">
                                                {
                                                    lunch.menu.cal
                                                    //bg-[#a0c4ff]
                                                }
                                            </div>
                                            <div className="h-full w-full items-center flex justify-center">
                                                <div
                                                    className="text-center leading-snug"
                                                    dangerouslySetInnerHTML={{
                                                        __html: String(
                                                            lunch.menu.DDISH_NM
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
                                        <div className="flex w-full h-full justify-center items-center">
                                            <p>급식 정보가 존재하지 않습니다</p>
                                        </div>
                                    )}
                                </div>
                            </SwiperSlide>
                        );
                    })}

                    <div className="slider-controler">
                        <div className="swiper-button-prev slider-arrow">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="#fff"
                                width="24"
                                height="24"
                                className="rotate-180"
                            >
                                <path d="M10 6l-1.41 1.41L13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
                            </svg>
                        </div>
                        <div className="swiper-button-next slider-arrow">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="#fff"
                                width="24"
                                height="24"
                            >
                                <path d="M10 6l-1.41 1.41L13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
                            </svg>
                        </div>
                        {/* <div className="swiper-pagination"></div> */}
                    </div>
                </Swiper>
            </div>
        </div>
    );
};

export default MobileMealCarousel;
