"use client";

import styled from "styled-components";

const SpinnerContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6); // Opaque gray background
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999; // Ensure it's on top of other elements
`;

export const LoadingSpinner = () => {
    return (
        <SpinnerContainer>
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
        </SpinnerContainer>
    );
};
