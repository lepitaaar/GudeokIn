"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function BroadCastChannel({
    children,
}: {
    children: ReactNode;
}) {
    const router = useRouter();

    useEffect(() => {
        const channel = new BroadcastChannel("notification_channel");

        channel.addEventListener("message", (event) => {
            if (event.data.type === "NAVIGATE") {
                const url = event.data.url;
                if (url) {
                    router.push("/");
                    router.push(url);
                }
            }
        });

        return () => {
            channel.close();
        };
    }, [router]);

    return <>{children}</>;
}
