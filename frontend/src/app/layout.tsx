import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareChrono - AI Clinical Timelines",
  description: "Empowering clinical documentation with local offline AI, transcription, and professional PDF summary reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f4f9f8] text-[#10201f]">
        {children}
      </body>
    </html>
  );
}

