import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";
import Navbar from "@/components/Navbar";
import ToastContainer from '@/components/ToastContainer'
import { ThemeProvider } from "next-themes";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "CollegeCompass",
  description: "College discovery and decision platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={plusJakartaSans.variable}>
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
