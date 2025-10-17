"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButtons from "./authButtons";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`btn btn-ghost ${active ? "font-semibold underline underline-offset-4" : ""}`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  return (
    <header className="border-b bg-base-100">
      <div className="container mx-auto w-full max-w-6xl">
        {/* Grid guarantees one horizontal row: left / center / right */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-14">
          {/* LEFT */}
          <div className="justify-self-start">
            <Link href="/" className="btn btn-ghost text-xl">BhangraScape</Link>
          </div>

          {/* CENTER (hidden on xs for now) */}
          <nav className="hidden sm:flex gap-5 justify-self-center whitespace-nowrap">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/events">Events</NavLink>
            <NavLink href="/members">Members</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </nav>

          {/* RIGHT */}
          <div className="justify-self-end shrink-0 whitespace-nowrap">
            <AuthButtons />
          </div>
        </div>
      </div>
    </header>
  );
}