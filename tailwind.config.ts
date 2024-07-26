import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                pretendard: ["var(--font-pretendard)"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            fontSize: {
                titleSize: "16px",
                subtitleSize: "13px",
            },
            colors: {},
            keyframes: {
                fadeInOut: {
                    "0%, 100%": { opacity: "0" },
                    "50%": { opacity: "1" },
                },
            },
            animation: {
                fadeInOut: "fadeInOut 3s ease-in-out",
            },
        },
    },
    plugins: [require("tailwind-scrollbar-hide")],
};
export default config;
