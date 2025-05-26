import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomToaster from "@/components/CustomToaster";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <CustomToaster />
      <body>
        {children}
      </body>
    </html>
  );
}
