import Link from "next/link";
import Image from "next/image";
import type { Member } from "../types/members";

function initials(name: string){
    return name.split(" ").filter(Boolean).slice(0,2).map((item)=> item[0]?.toUpperCase()).join("")
}

export default function MemberCard({member}: {member: Member}){
    const hasAvatar = !!member.avatarUrl;

     return (
    <li className="card bg-base-100 shadow hover:shadow-md transition">
      <Link href={`/members/${member.id}`} className="card-body items-center text-center gap-3 bg-indigo-50">
        <figure className="mt-2">
          {hasAvatar ? (
            <Image
              src={member.avatarUrl as string}
              alt={member.name}
              width={96}
              height={96}
              className="rounded-full object-cover w-24 h-24"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-base-300 grid place-items-center">
              <span className="text-lg font-semibold">{initials(member.name)}</span>
            </div>
          )}
        </figure>
        <h3 className="font-semibold">{member.name}</h3>
        {/* No description on the grid per your spec */}
      </Link>
    </li>
  );

}