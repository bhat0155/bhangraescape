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
  <div className="container mx-auto w-full max-w-6xl">
    {/* Top bar: 3 fixed areas → left / center / right */}
    <div className="grid grid-cols-[auto_1fr_auto] items-center h-14">
      {/* LEFT: brand */}
      <Link href="/" className="btn btn-ghost text-xl">BhangraScape</Link>

      {/* CENTER: desktop nav */}
      <nav className="hidden sm:flex gap-5 justify-center">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/events">Events</NavLink>
        <NavLink href="/members">Members</NavLink>
        <NavLink href="/about">About</NavLink>
        <NavLink href="/contact">Contact</NavLink>
      </nav>



<div className="ml-auto sm:ml-0 flex items-center justify-end w-12 sm:w-auto">
  {/* Desktop auth (≥ sm) */}
  <div className="hidden sm:block">
    <AuthButtons />
  </div>

  {/* Mobile burger (≤ sm) */}
  <button
    type="button"
    className="sm:hidden inline-grid place-items-center w-10 h-10 btn btn-ghost"
    aria-label="Toggle menu"
    aria-expanded={open}
    onClick={() => setOpen(v => !v)}
  >
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
      />
    </svg>
  </button>
</div>
    </div>

    {/* Mobile menu (below bar; expanding this won't move the button) */}
    <div className={`sm:hidden overflow-hidden transition-[max-height] duration-300 ${open ? "max-h-96" : "max-h-0"}`}>
      <nav className="flex flex-col gap-1 py-2 border-t">
        <NavLink href="/" onClick={close}>Home</NavLink>
        <NavLink href="/events" onClick={close}>Events</NavLink>
        <NavLink href="/members" onClick={close}>Members</NavLink>
        <NavLink href="/about" onClick={close}>About</NavLink>
        <NavLink href="/contact" onClick={close}>Contact</NavLink>

        {/* Auth inside mobile menu, centered */}
        <div className="pt-3 border-t flex justify-center">
          <AuthButtons />
        </div>
      </nav>
    </div>
  </div>
</header>
  );
}