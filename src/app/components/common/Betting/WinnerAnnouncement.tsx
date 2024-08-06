import { useState, useEffect } from "react";

interface WinnerAnnouncementProps {
    winner: string;
    luckyPerson: string;
    show: boolean;
}

const WinnerAnnouncement: React.FC<WinnerAnnouncementProps> = ({
    winner,
    show,
    luckyPerson,
}) => {
    const [showWinner, setShowWinner] = useState(false);
    const [showLuckyPerson, setShowLuckyPerson] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        if (show) {
            setShowOverlay(true);
            setShowWinner(true);
            setTimeout(() => {
                setShowWinner(false);
                setShowLuckyPerson(true);
            }, 3000); // 3초 후에 "승자는" 텍스트를 사라지게 하고 "당첨자는" 텍스트를 표시
            setTimeout(() => {
                setShowLuckyPerson(false);
                setShowOverlay(false);
            }, 6000); // 6초 후에 "당첨자는" 텍스트를 사라지게 함
        }
    }, [show]);

    return (
        <>
            {showOverlay && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
                    {showWinner && (
                        <div className="text-white text-4xl font-bold animate-fadeInOut">
                            승자는 {winner}팀!
                        </div>
                    )}
                    {showLuckyPerson && (
                        <div className="text-white text-3xl font-bold animate-fadeInOut text-center">
                            당첨자는 <p>{luckyPerson}</p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default WinnerAnnouncement;
