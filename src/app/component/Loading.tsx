import React from "react";

export default function Loading() {
    return (
        <div className="flex justify-center items-center align-middle h-[80vh] m-0 p-0">
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
        </div>
    );
}
