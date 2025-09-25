import axios from "axios";
import { useToken } from "@/src/hooks";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function redirectToAdmin() {
    if (typeof window !== "undefined") {
        window.location.replace("/admin");
    }
}

export function useAuthFetcher() {
    const token = useToken();
    return async (url) => {
        if (!token) {
            redirectToAdmin();
            return;
        }
        const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
        const res = await axios.get(fullUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data.data;
    };
}

export function useAuthPost() {
    const token = useToken();
    return async (url, data) => {
        if (!token) {
            redirectToAdmin();
            return;
        }
        const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
        const res = await axios.post(fullUrl, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    };
}

export function useLoginPost() {
    return async (url, data) => {
        const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
        const res = await axios.post(fullUrl, data);
        return res.data;
    };
}

export function useAuthPut() {
    const token = useToken();
    return async (url, data) => {
        if (!token) {
            redirectToAdmin();
            return;
        }
        console.log(token)
        const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
        const res = await axios.put(fullUrl, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    };
}

export function useAuthDelete() {
    const token = useToken();
    return async (url) => {
        if (!token) {
            redirectToAdmin();
            return;
        }
        const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
        const res = await axios.delete(fullUrl, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    };
}