import type { Metadata } from "next";
import { Sarabun, Noto_Sans_Thai, Geist_Mono } from "next/font/google";
import "./globals.css";

// ฟอนต์ให้ตรงกับ output.html (Sarabun → Noto Sans Thai)
const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ใบประเมินราคา — Presales",
  description: "ระบบใบประเมินค่าใช้จ่ายโปรเจกต์ โดยเคาะดีญะฮ์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${sarabun.variable} ${notoThai.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
