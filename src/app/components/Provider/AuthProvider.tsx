"use client";

import { User } from "@/app/export/DTO";
import React, { createContext, useContext, useEffect } from "react";
import axios from "@/app/lib/axios";
import useFcmToken from "@/app/hooks/useFcmToken";

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
    children: React.ReactNode;
    session: any;
}> = ({ children, session }) => {
    const authState: AuthContextType = {
        isLoggedIn: !!session,
        user: session?.user || null,
    };
    const { token } = useFcmToken();
    useEffect(() => {
        async function getToken() {
            if (!token) return;
            try {
                await axios.post(`/api/auth/me`, {
                    fcm: token,
                });
            } catch (error) {
                console.log(`Token Saved Error: ${error}`);
            }
        }
        getToken();
    }, [token]);
    return (
        <AuthContext.Provider value={authState}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
