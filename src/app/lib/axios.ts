import axios, { isAxiosError } from "axios";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_HOST,
    responseType: "json",
});

// 요청 인터셉터 설정
instance.interceptors.request.use(
    (config) => {
        const token = getCookie("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => Promise.resolve(response),
    async (error) => {
        const originalRequest = error.config;
        if (isAxiosError(error)) {
            if (error.response && error.response?.status == 401) {
                try {
                    const acToken = getCookie("accessToken");
                    const rfToken = getCookie("refreshToken");

                    if (acToken === undefined || rfToken === undefined) return;

                    const { data } = await instance.post(
                        `/api/auth/refresh`,
                        {
                            refreshToken: rfToken,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${acToken}`,
                            },
                        }
                    );
                    setCookie("accessToken", data.accessToken, {
                        path: "/",
                        maxAge: 60 * 60 * 24 * 14,
                    });
                    setCookie("refreshToken", data.refreshToken, {
                        path: "/",
                        maxAge: 60 * 60 * 24 * 14,
                        // httpOnly: true,
                    });
                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    return instance(originalRequest);
                } catch (error) {
                    deleteCookie("accessToken");
                    deleteCookie("refreshToken");
                    return Promise.reject(error);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
