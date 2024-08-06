"use client";

import styled from "styled-components";

const SpinnerContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    max-width: 100%;
    max-height: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
`;

const SpinnerBox = styled.div`
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 10px;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const LoadingSpinner = () => {
    return (
        <SpinnerContainer>
            <SpinnerBox>
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
                    </g>
                </svg>
            </SpinnerBox>
        </SpinnerContainer>
    );
};
