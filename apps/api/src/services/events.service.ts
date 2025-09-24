import { prisma } from "../lib/prisma"
import { Weekday } from "@prisma/client"

export const eventService = {
    async createEvent(data: {title: string, description: string, date: string}){
        return {ok: true}
    },
    async getOne(_eventId: string){
        return {ok: true}
    },

    async getEventDetail(eventId: string, user: {id: string, role?: string} | null){
        const event = await prisma.event.findUnique({
            where: {id: eventId},
            select: {id: true, title: true, location: true, date: true, coverUrl: true}
        })
        if(!event){
            const e:any = new Error("Event not found");
            e.status = 404;
            throw e;
        }

        // computing capabilities
        const now = new Date();
        const eventIsFuture = event.date.getTime() > now.getTime();
        const isMemberOrAdmin = user && ["MEMBER", "ADMIN"].includes(user.role ?? "");

        // interested performers
        const interested = await prisma.interest.findMany({
            where: {eventId: event.id, interested: true},
            select: {user: {select:{id: true, name: true, avatarUrl: true, description: true}}}
        })
        const performers = interested.map((i)=> i.user);



        // availability tallies
        const prefs = await prisma.availabilityPreference.findMany({
            where: {eventId: event.id},
            select: {days: true}
        })
        const tallies : Record<string, number> ={MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0, SAT: 0, SUN: 0,};
        // loop through each person's availability
        for(let p of prefs){
            // loop through each day they are available and count
            for(let d of p.days){
                tallies[d] = (tallies[d]??0)+1;
            }
        }

        // extracting the 2 most popular days
        // convert tallies to object of [day, count]
        const weekDayOrder : Weekday[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

        // sort by count first, then by day of week
        const sortedDays = Object.entries(tallies).sort((a,b)=>(a[1]-b[1]) || (weekDayOrder.indexOf(a[0] as Weekday) - weekDayOrder.indexOf(b[0] as Weekday)));

        // Most popular days are first 2 elements of sorted Array
        const topDays = sortedDays.slice(0,2).map(([weekday, count])=> {
            return {weekday: weekday as Weekday, count}
        });

        // this section shows user's preferences when they visit the detail page
        let interestedMe = false;
        let myDays: Weekday[] = [];
        // for logged in users only
        if(user?.id){
            // promise.all to check current's interest and availability
            const [myInterest, myAvailability] = await Promise.all([
                prisma.interest.findUnique({
                    where: {eventId_userId: {eventId, userId: user.id}},
                }),
                prisma.availabilityPreference.findUnique({
                    where: {eventId_userId: {eventId, userId: user.id}},
                })
            ])

            // set the value of interested to true only if a record exists and it's true
            interestedMe = !!myInterest?.interested;

            // set my days to user's selected days or empty array
            myDays = myAvailability?.days ?? [];
        }

        return {
            event,
            capabilities: {
                canSetInterest: !!(eventIsFuture && isMemberOrAdmin),
                canSetAvailability: !!(eventIsFuture && isMemberOrAdmin),
            },
            performers,
            tallies,
            topDays,
            interested: interestedMe,
            myDays 
        }

    }
}