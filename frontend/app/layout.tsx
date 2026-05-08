import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Local Stage",
  description:
    "Local Stage는 운영 중인 동네 카페를 작은 문화 공간으로 연결합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="border-t border-line bg-white/70">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-primary/80 sm:px-6 lg:px-8">
            <p className="font-semibold text-primary">Local Stage</p>
            <p>
              동네 카페가 문을 연 채로, 쓰이지 않던 벽과 코너와 조용한
              시간대가 일상 속 작은 무대가 됩니다.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
