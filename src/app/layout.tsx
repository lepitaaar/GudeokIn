import type {
    GetServerSideProps,
    GetServerSidePropsContext,
    Metadata,
} from "next";
import localFont from "next/font/local";
import "./globals.css";
import type { Viewport } from "next";
import AddToHomeDialong from "./component/mobile/A2HSDialog";
import { LoadingProvider } from "./LoadingProvider";
import { Suspense } from "react";
import nookies from "nookies";
import { verifyToken, verifyTokenWithString } from "@/middleware";

const pretendard = localFont({
    src: "../fonts/PretendardVariable.woff2",
    display: "swap",
    weight: "45 920",
    variable: "--font-pretendard",
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    metadataBase: new URL("https://gudeok.kr"),
    title: {
        template: "%s | 구덕인",
        default: "구덕인",
    },
    description: "부산 구덕고등학교 학생 서비스 플랫폼.",
    manifest: "/manifest.json",
    openGraph: {
        type: "website",
        url: "https://gudeok.kr",
        title: "구덕인",
        description: "부산 구덕고등학교 학생 서비스 플랫폼.",
        images: [
            {
                url: "/opengraph-image.png", // 이미지의 상대 경로
                width: 1200,
                height: 630,
                alt: "구덕인 이미지",
            },
        ],
    },
    icons: {
        other: [
            {
                url: "/splash_screens/iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_landscape.png",
                media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/iPhone_15_Pro__iPhone_15__iPhone_14_Pro_landscape.png",
                media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png",
                media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png",
                media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png",
                media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png",
                media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/iPhone_11__iPhone_XR_landscape.png",
                media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png",
                media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png",
                media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png",
                media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/13__iPad_Pro_M4_landscape.png",
                media: "(device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/12.9__iPad_Pro_landscape.png",
                media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/11__iPad_Pro_M4_landscape.png",
                media: "(device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/11__iPad_Pro__10.5__iPad_Pro_landscape.png",
                media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/10.9__iPad_Air_landscape.png",
                media: "(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/10.5__iPad_Air_landscape.png",
                media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/10.2__iPad_landscape.png",
                media: "(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png",
                media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/8.3__iPad_Mini_landscape.png",
                media: "(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png",
                media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png",
                media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png",
                media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png",
                media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png",
                media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
                rel: "apple-touch-startup-image",
            },
            {
                url: "/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png",
                media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
                rel: "apple-touch-startup-image",
            },
        ],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    //after change mobile navbar, desktop
    return (
        <html lang="ko">
            <body className={`${pretendard.variable} font-pretendard`}>
                <Suspense>
                    <LoadingProvider>
                        {children}
                        <AddToHomeDialong />
                    </LoadingProvider>
                </Suspense>
            </body>
        </html>
    );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const cookies = nookies.get(ctx);
    const { accessToken, refreshToken } = cookies;

    if (!accessToken || !refreshToken) {
        // If either token is missing, delete the cookies
        nookies.destroy(ctx, "accessToken");
        nookies.destroy(ctx, "refreshToken");
        return { props: {} };
    }

    const isAccessTokenValid = await verifyTokenWithString(accessToken);
    const isRefreshTokenValid = await verifyTokenWithString(refreshToken);

    if (!isAccessTokenValid.ok || !isRefreshTokenValid.ok) {
        nookies.destroy(ctx, "accessToken");
        nookies.destroy(ctx, "refreshToken");
    }

    return {
        props: {}, // Pass any additional props here if needed
    };
}
