import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/app/providers";
import Navbar from "@/components/Navbar";
import ToastContainer from '@/components/ToastContainer'
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "CollegeCompass",
  description: "College discovery and decision platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="light">
          <Providers>
            <Navbar />
            <main className="container-shell py-8">{children}</main>
          </Providers>
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
