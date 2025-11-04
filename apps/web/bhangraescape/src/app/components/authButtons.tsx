// src/components/authButtons.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="loading loading-spinner loading-sm" aria-label="Loading" />;
  }

  if (!session) {
    return (
      <button
        className="btn btn-sm btn-neutral whitespace-nowrap py-4 px-2 bg-indigo-600 text-white"
        onClick={() => signIn("google")}
      >
        Login
      </button>
    );
  }

  const name = session.user?.name ?? "User";
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      {/* Small user pill (hide the name on small screens to save space) */}
      <span className="badge badge-ghost px-2">
        <span className="mr-1 inline-grid place-items-center w-5 h-5 rounded-full bg-base-300 text-xs">
          {initial}
        </span>
        {/* <span className="hidden md:inline-block max-w-[160px] truncate">Hi, {name}</span> */}
      </span>

      <button className="btn btn-sm btn-outline py-4 px-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => signOut()}>
        Logout
      </button>
    </div>
  );
}