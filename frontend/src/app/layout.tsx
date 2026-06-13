import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem("carechrono-theme");
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                const theme = savedTheme || (prefersDark ? "dark" : "light");
                document.documentElement.classList.toggle("dark", theme === "dark");
                document.documentElement.style.colorScheme = theme;
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}

