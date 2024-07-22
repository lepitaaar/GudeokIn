import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.gudeok.kr",
                pathname: "/**",
            },
        ],
    },
};

export default withPWA({
    dest: "build",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
})(nextConfig);
