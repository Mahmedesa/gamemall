import { createContext, useContext, useState } from "react";
import { login as loginApi, logout as logoutApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("gamemall_user");

        return savedUser
            ? JSON.parse(savedUser)
            : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("gamemall_token");
    });

    const login = async (credentials) => {
        const response = await loginApi(credentials);

        if (!response.data.success) {
            throw new Error(
                response.data.message || "Login failed"
            );
        }

        const authData = response.data.data;

        localStorage.setItem(
            "gamemall_token",
            authData.token
        );

        localStorage.setItem(
            "gamemall_user",
            JSON.stringify(authData)
        );

        setToken(authData.token);
        setUser(authData);

        return authData;
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.error("Logout API error:", error);
        } finally {
            localStorage.removeItem("gamemall_token");
            localStorage.removeItem("gamemall_user");

            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated: !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}