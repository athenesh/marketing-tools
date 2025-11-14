import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "마케팅 도구 모음 - ROAS, ROI, 손익분기점 계산기",
  description: "광고 성과, 손익분기점, 전환율, LTV 등 마케팅에 필요한 모든 계산 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 공통 헤더 */}
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-2xl">🎯</span>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  마케팅 도구 모음
                </h1>
              </Link>
              
              {/* 데스크톱 네비게이션 */}
              <nav className="hidden lg:flex gap-4 xl:gap-6">
                <Link
                  href="/ad-performance"
                  className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm xl:text-base whitespace-nowrap"
                >
                  📊 광고 성과
                </Link>
                <Link
                  href="/break-even"
                  className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm xl:text-base whitespace-nowrap"
                >
                  💰 손익분기점
                </Link>
                <Link
                  href="/conversion-rate"
                  className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm xl:text-base whitespace-nowrap"
                >
                  📈 전환율
                </Link>
                <Link
                  href="/ltv"
                  className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm xl:text-base whitespace-nowrap"
                >
                  👥 LTV
                </Link>
              </nav>

              {/* 모바일 메뉴 버튼 */}
              <Link
                href="/"
                className="lg:hidden px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
              >
                메뉴
              </Link>
            </div>
          </div>
        </header>

        {/* 페이지 컨텐츠 */}
        {children}
      </body>
    </html>
  );
}
