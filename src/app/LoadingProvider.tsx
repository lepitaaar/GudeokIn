"use client";
"use client";

import {
    useState,
    useEffect,
    createContext,
    useContext,
    ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "./components/common/LoadingSpinner";

const LoadingContext = createContext({ isLoading: false });

export const useLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleRouteChange = () => {
            setIsLoading(true);
            timeoutId = setTimeout(() => setIsLoading(false), 500); // 예시로 500ms 후에 로딩 상태 해제
        };

        handleRouteChange(); // 초기 로드 시 실행

        return () => {
            clearTimeout(timeoutId);
        };
    }, [pathname, searchParams]); // pathname이나 searchParams가 변경될 때마다 효과 실행

    return (
        <LoadingContext.Provider value={{ isLoading }}>
            {isLoading && <LoadingSpinner />}
            {children}
        </LoadingContext.Provider>
    );
}
