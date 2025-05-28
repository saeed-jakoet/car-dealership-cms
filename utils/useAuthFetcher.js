import axios from "axios";
import { useToken } from "@/components/TokenProvider";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function useAuthFetcher() {
    const token = useToken();
    return async (url) => {
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
        const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
        const res = await axios.post(fullUrl, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    };
}

export function useAuthPut() {
    const token = useToken();
    return async (url, data) => {
        const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
        const res = await axios.put(fullUrl, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    };
}