import MemberCard from "../components/MembersCard";
import type { Member } from "../types/members";

export default async function MembersPage(){
const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const res = await fetch(`${origin}/api/members`, { cache: "no-store" });
    if(!res.ok){
        throw new Error(`Failed to load the members ${res.statusText}`);
    }

    const items =(await res.json()) as Member[];
   const members = items?.data;

    return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-primary">Members</h1>
          <p className="opacity-70">Browse our members.</p>
        </div>

        {/* "Add Member" comes in Phase 3 (client modal). For now, just the list. */}
      </header>

      {members.length === 0 ? (
        <div className="rounded-xl bg-base-100 shadow p-8 text-center opacity-80">
          No members yet.
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {members.map((m: Member) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </ul>
      )}
    </div>
  );
}