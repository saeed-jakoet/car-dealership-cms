
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomToaster from "@/components/Toast";
import { cookies } from "next/headers";
import TokenProvider from "@/components/TokenProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Car Dealership CMS",
    description: "A simple CMS for managing car listings",
};

export default async function RootLayout({ children }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value || null;

    return (
        <html lang="en">
        <body>
        <TokenProvider token={token}>
            {children}
        </TokenProvider>
        <CustomToaster />
        </body>
        </html>
    );
}