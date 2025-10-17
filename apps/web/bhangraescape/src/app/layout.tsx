import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionClient from "../app/components/sessionClient";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BhangraScape",
  description: "Bhangra event management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<html lang="en" data-theme="cupcake">
      <body className="min-h-dvh flex flex-col">
    <a href="#main"className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 btn btn-sm"
> Skip to main content</a>
<SessionClient>
  <Navbar/>
       <main id="main" className="container mx-auto w-full max-w-6xl flex-1 p-4 md:p-6">
           {children}
      </main>
      <Footer/>
</SessionClient>
    </body>
   </html>
  );
}
