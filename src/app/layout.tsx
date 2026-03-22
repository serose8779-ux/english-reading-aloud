import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "English Reading Aloud 🔊",
  description: "초등학생을 위한 영어 문장 읽어주기 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
