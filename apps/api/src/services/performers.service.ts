import { prisma } from "../lib/prisma";

export async function listEligiblePerformers(){
    // only admins and members are eligible to perform
    const users= await prisma.user.findMany({
        where: {role: {in:["ADMIN", "MEMBER"]}},
        select: {id: true, name: true, avatarUrl: true, role: true},
        orderBy: [{role: "desc"}, {name: "asc"}]
    })
    return users;
}

export async function setPerformersForEvent(eventId: string, userIds: string[]){
    // ensure event exist
    const event = await prisma.event.findUnique({
        where: {id: eventId},
        select: {id: true}
    })

    if(!event){
        const e: any = new Error("Event not found");
        e.status = 404;
        throw e;
    }
    // transaction does 2 things at once
    // delete everyone not in list
    // upsert everyone in upcoming list with interested = true

    await prisma.$transaction(async (tx)=>{
        // remove everyone not selected
        await tx.interest.deleteMany({
            where: {
                eventId,
                interested: true,
                userId: {notIn: userIds.length ? userIds: ["_NONE_"]} // if empty, delete all

            }
        })

        // upsert selected performers
        for(const uid of userIds){
            await tx.interest.upsert({
            where: { eventId_userId: { eventId, userId: uid } },
                 update: {interested: true},
                create: { eventId, userId: uid, interested: true },
            })
        }
    });

    const performers= await prisma.user.findMany({
        where: {role:{in: ["ADMIN", "MEMBER"]}, interests: {some: {eventId, interested: true}}},
         select: { id: true, name: true, avatarUrl: true, description: true },
         orderBy: { name: "asc" },
    })

   return {
    count: performers.length,
    performers
   }
}
