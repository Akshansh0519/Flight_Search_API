import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SkyElite | Premium Flight & Private Jet Service",
  description: "Experience premium, accessible private jets and commercial flight booking powered by modern microservices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} font-sans h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans selection:bg-[#202A36] selection:text-white">
        {children}
      </body>
    </html>
  );
}
