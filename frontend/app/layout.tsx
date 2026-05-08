import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "컬처 SPOT!",
  description:
    "컬처 SPOT!은 운영 중인 동네 카페를 작은 문화 공간으로 연결합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
