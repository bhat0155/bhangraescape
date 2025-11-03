"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButtons from "./authButtons";
import { useState } from "react";

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`btn btn-ghost ${active ? "font-semibold underline underline-offset-4" : ""}`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="border-b bg-base-100">
      {/* ✨ Make the container relative so we can absolutely position the burger */}
      <div className="container mx-auto w-full max-w-6xl relative">
        {/* Top bar: Left / Center / Right (desktop layout unchanged) */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-14">
          {/* LEFT: Brand */}
          <div className="justify-self-start">
            <Link href="/" className="btn btn-ghost text-xl">BhangraScape</Link>
          </div>

          {/* CENTER: Desktop nav */}
          <nav className="hidden sm:flex gap-5 justify-self-center whitespace-nowrap">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/events">Events</NavLink>
            <NavLink href="/members">Members</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </nav>

          {/* RIGHT: Desktop auth only (burger removed from here) */}
          <div className="justify-self-end shrink-0 whitespace-nowrap hidden sm:block">
            <AuthButtons />
          </div>
        </div>

        {/* ✨ ABSOLUTE burger: extreme right on mobile */}
        <button
          type="button"
          className="sm:hidden absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>

        {/* Mobile menu (slide-down) */}
        <div
          className={`sm:hidden overflow-hidden transition-[max-height] duration-300 ${
            open ? "max-h-96" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col gap-1 py-2 border-t">
            <NavLink href="/" onClick={close}>Home</NavLink>
            <NavLink href="/events" onClick={close}>Events</NavLink>
            <NavLink href="/members" onClick={close}>Members</NavLink>
            <NavLink href="/about" onClick={close}>About</NavLink>
            <NavLink href="/contact" onClick={close}>Contact</NavLink>

            {/* AuthButtons centered in the mobile menu */}
            <div className="pt-3 border-t flex justify-center">
              <AuthButtons />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}