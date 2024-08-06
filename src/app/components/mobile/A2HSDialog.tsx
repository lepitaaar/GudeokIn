"use client";
import { useEffect, useState } from "react";

export default function Home() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as any);
            if (!localStorage.getItem("installPromptDismissed")) {
                setShowInstallPrompt(true);
            }
        };

        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setIsIOS(true);
            if (!localStorage.getItem("iosPromptDismissed")) {
                setShowIOSPrompt(true);
            }
        }

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt
        );

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
        };
    }, []);

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === "accepted") {
                    console.log("User accepted the A2HS prompt");
                } else {
                    console.log("User dismissed the A2HS prompt");
                }
                setDeferredPrompt(null);
                setShowInstallPrompt(false);
            });
        }
    };

    const handleCancelClick = () => {
        localStorage.setItem("installPromptDismissed", "true");
        setShowInstallPrompt(false);
    };

    const handleIOSDismiss = () => {
        localStorage.setItem("iosPromptDismissed", "true");
        setShowIOSPrompt(false);
    };

    return (
        <>
            {showInstallPrompt && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md bg-white p-4 border border-gray-300 shadow-lg rounded-lg z-50">
                    <p className="mb-4 text-center">
                        이 앱을 홈 화면에 추가하여 더 나은 경험을 즐기세요.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={handleInstallClick}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                        >
                            설치
                        </button>
                        <button
                            onClick={handleCancelClick}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
                        >
                            취소
                        </button>
                    </div>
                </div>
            )}

            {showIOSPrompt && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md bg-white p-4 border border-gray-300 shadow-lg rounded-lg z-50">
                    <p className="mb-4 text-center">
                        <span>
                            홈 화면에 추가하고 다양한 기능을 경험하세요!{" "}
                        </span>
                        <span>이 앱을 홈 화면에 추가하려면 </span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="#5f6368"
                            className="inline-block mx-1"
                        >
                            <path d="M240-40q-33 0-56.5-23.5T160-120v-440q0-33 23.5-56.5T240-640h80q17 0 28.5 11.5T360-600q0 17-11.5 28.5T320-560h-80v440h480v-440h-80q-17 0-28.5-11.5T600-600q0-17 11.5-28.5T640-640h80q33 0 56.5 23.5T800-560v440q0 33-23.5 56.5T720-40H240Zm200-727-36 36q-12 12-28 11.5T348-732q-11-12-11.5-28t11.5-28l104-104q12-12 28-12t28 12l104 104q11 11 11 27.5T612-732q-12 12-28.5 12T555-732l-35-35v407q0 17-11.5 28.5T480-320q-17 0-28.5-11.5T440-360v-407Z" />
                        </svg>
                        <span>
                            {" "}
                            버튼을 누르고 &apos;홈 화면에 추가&apos;를
                            선택하세요.
                        </span>
                    </p>
                    <div className="flex justify-center">
                        <button
                            onClick={handleIOSDismiss}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
