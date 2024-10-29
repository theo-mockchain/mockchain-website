import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Mockchain",
  description: "Your decentralized future, visualized",
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
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(30, 41, 59, 0.8)",
              color: "#e2e8f0",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(148, 163, 184, 0.1)",
              borderRadius: "0.5rem",
              padding: "1rem",
              fontSize: "0.875rem",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#e2e8f0",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#e2e8f0",
              },
            },
            loading: {
              iconTheme: {
                primary: "#3b82f6",
                secondary: "#e2e8f0",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
