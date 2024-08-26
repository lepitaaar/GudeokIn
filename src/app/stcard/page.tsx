"use client";

import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import NavBarLayout from "../components/mobile/Header/NavBarLayout";
import Modal from "react-modal";
import Image from "next/image";
import Barcode from "react-barcode";

const BarcodeScanner: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [barcodeResult, setBarcodeResult] = useState<string>("");
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        const videoElement = videoRef.current;

        if (navigator.mediaDevices && videoElement) {
            navigator.mediaDevices
                .getUserMedia({ video: { facingMode: "environment" } })
                .then((stream) => {
                    videoElement.srcObject = stream;
                    videoElement.setAttribute("playsinline", "true");
                    videoElement.play();
                    codeReader.decodeFromVideoDevice(
                        null,
                        videoElement,
                        (result, err) => {
                            if (result) {
                                setBarcodeResult(result.getText());
                            }
                            if (err && !(err instanceof NotFoundException)) {
                                console.error(err);
                            }
                        }
                    );
                })
                .catch((err) => {
                    console.error(err);
                    //setBarcodeResult(Error accessing camera: ${err.message});
                });

            return () => {
                codeReader.reset();
                if (videoElement.srcObject) {
                    (videoElement.srcObject as MediaStream)
                        .getTracks()
                        .forEach((track) => track.stop());
                }
            };
        }
    }, []);
    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        const videoElement = videoRef.current;

        if (navigator.mediaDevices && videoElement && modalIsOpen) {
            navigator.mediaDevices
                .getUserMedia({ video: { facingMode: "environment" } })
                .then((stream) => {
                    videoElement.srcObject = stream;
                    videoElement.setAttribute("playsinline", "true");
                    videoElement.play();
                    codeReader.decodeFromVideoDevice(
                        null,
                        videoElement,
                        (result, err) => {
                            if (result) {
                                setBarcodeResult(result.getText());
                                setModalIsOpen(false); // Close modal on successful scan
                            }
                            if (err && !(err instanceof NotFoundException)) {
                                console.error(err);
                            }
                        }
                    );
                })
                .catch((err) => {
                    console.error(err);
                    setBarcodeResult(`Error accessing camera: ${err.message}`);
                });

            return () => {
                codeReader.reset();
                if (videoElement.srcObject) {
                    (videoElement.srcObject as MediaStream)
                        .getTracks()
                        .forEach((track) => track.stop());
                }
            };
        }
    }, [modalIsOpen]);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (
        <NavBarLayout>
            <div className="flex items-center justify-center mt-5">
                <div className="flex flex-col items-center border rounded-xl overflow-hidden shadow-lg">
                    <div className="bg-[#0071bb] h-[33px] w-full"></div>
                    <div className="space-y-2 p-4 flex flex-col justify-center items-center pt-2">
                        <p
                            className="font-bold text-2xl"
                            style={{
                                letterSpacing: "0.4em",
                                marginLeft: "0.4em",
                            }}
                        >
                            학생증
                        </p>
                        <div className="relative w-[150px] h-[170px]">
                            <Image
                                alt="이미지"
                                src={"/default-profile.webp"}
                                fill
                            />
                        </div>
                        <p
                            className="font-bold text-4xl"
                            style={{
                                marginLeft: "0.7em",
                                letterSpacing: "0.7em",
                            }}
                        >
                            안재현
                        </p>
                        <Barcode
                            value="S2010028"
                            format="CODE39"
                            displayValue={false}
                            width={1.67}
                            height={55}
                        />

                        <Image
                            src={"/school-logo.png"}
                            width={158}
                            height={33}
                            alt="로고"
                        />
                    </div>
                </div>
            </div>
            {/**
             * 
                <div className="flex flex-col items-center justify-center">
                    <p className="text-lg mt-4">{barcodeResult}</p>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                        onClick={openModal}
                    >
                        학생증을 입력하시겠습니까?
                    </button>
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        contentLabel="Barcode Scanner"
                        className="flex items-center justify-center h-full"
                        overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-75"
                    >
                        <div className="relative w-3/4 h-3/4 bg-white p-4 rounded">
                            <button
                                className="absolute top-2 right-2 text-gray-600"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                            <video
                                ref={videoRef}
                                className="w-full h-full border border-gray-300 rounded"
                            />
                        </div>
                    </Modal>
                </div>
             */}
        </NavBarLayout>
    );
};

export default BarcodeScanner;
