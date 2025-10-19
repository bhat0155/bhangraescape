import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionClient from "../app/components/sessionClient";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { auth } from "./api/auth/[...nextauth]/route";



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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
<html lang="en" data-theme="cupcake">
       <body className="min-h-dvh flex flex-col bg-base-100 text-base-content">
    <a href="#main"className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 btn btn-sm"
> Skip to main content</a>
<SessionClient session={session}>
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
