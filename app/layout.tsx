import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interpattanasat Key Management",
  description:
    "Dashboard ระบบติดตามการยืม-คืนกุญแจห้องเรียนและทรัพย์สินของโรงเรียน Interpattanasat",
  icons: {
    icon: "/college-logo.svg",
    shortcut: "/college-logo.svg",
    apple: "/college-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
