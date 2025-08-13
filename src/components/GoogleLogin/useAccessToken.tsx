import { useEffect, useState } from "react";

export const useAccessToken = () => {
    const [accessToken, setAccessToken] = useState<string>("");

    useEffect(() => {
        const token = localStorage.getItem("access_token") || "";
        setAccessToken(token);
    }, []);

    return accessToken;
}