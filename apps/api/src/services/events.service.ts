import { prisma } from "../lib/prisma"
import { Weekday } from "@prisma/client"
const weekDayOrder : Weekday[]= ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const emptyTallies =()=>{
    return {MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0, SAT: 0, SUN: 0,};
}

// compute top tallies helper function
function computeTopDays(tallies: Record<string, number>){
    return Object.entries(tallies).sort((a,b)=>(b[1]-a[1])||(weekDayOrder.indexOf(a[0] as Weekday) - weekDayOrder.indexOf(b[0] as Weekday)) ).slice(0,2).map(([weekday, count])=> {
        return {weekday: weekday as Weekday, count}
    });
}

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

    },

    async toggleInterest(user: {id: string, role?: string}| null, eventId: string, interested: boolean){
        // authorization guard
        const isMemberOrAdmin = user && ["MEMBER","ADMIN"].includes(user.role ?? "");
        if(!isMemberOrAdmin){
            const e: any = new Error("Not authorized");
            e.status = 403;
            throw e;
        }

        // check if event exists and is in future
        const event = await prisma.event.findUnique({
            where: {id: eventId},
            select: {id: true, date: true}
        });

        if(!event){
            const e: any = new Error("Event not found");
            e.status=404;
            throw e;
        }

        const isEventInFuture = event.date.getTime()>  Date.now();
        if(!isEventInFuture){
            const e:any = new Error("cannot modify past events");
            e.status = 403;
            throw e;
        }

        // upsert interest row
        await prisma.interest.upsert({
            where: {eventId_userId: {eventId, userId: user!.id}},
            create:{eventId, userId: user!.id, interested},
            update:{interested},
        });

        // recount performers
        const performerCount = await prisma.interest.count({
            where: {eventId, interested: true}
        })

        return {interested, performerCount}
    },

    // get availability
    async getAvailability(eventId: string, user: {id: string, role?: string}|null){
        const event = await prisma.event.findUnique({
            where: {id: eventId},
        })

         if(!event){
            const e: any = new Error("Event not found");
            e.status=404;
            throw e;
        }

        // get and combine all preferences for the event
        const prefs = await prisma.availabilityPreference.findMany({
            where: {eventId},
            select: {userId: true, days: true}
        })

        const tallies = emptyTallies();
        for(let p of prefs){
            for (let d of p.days){
                tallies[d] = (tallies[d]??0)+1;
            }
        }
        const topDays = computeTopDays(tallies);

        let myDays: Weekday[] = [];
        if(user?.id){
            const mine =  prefs.find((p)=> p.userId == user.id)
            myDays = mine?.days ?? [];
        }
        return {eventId, tallies, topDays, myDays}
    },

    async setAvailability(user: {id: string, role?: "MEMBER"|"ADMIN"|"GUEST"},eventId: string,days: Weekday[] ){
        // authorization guard
        if(!user?.id){
            const e:any=new Error("Not authorized");
            e.status=403;
            throw e;
        }

        // guests cannot set availability
        if(!["MEMBER","ADMIN"].includes(user.role ?? "")){
            const e: any = new Error("Forbidden, insufficient role");
            e.status=403;
            throw e;
        }

        // check if event exists and is in future
        const event = await prisma.event.findUnique({
            where: {id: eventId}
        })
        if(!event){
            const e: any = new Error("Event not found");
            e.status = 404;
            throw e
        }

        const isEventInFuture = event.date.getTime()> Date.now();
        if(!isEventInFuture){
            const e: any = new Error("Cannot modify past events");
            e.status = 403;
            throw e;
        }

        // upsert my availability
        await prisma.availabilityPreference.upsert({
            where: {eventId_userId: {eventId, userId: user.id}},
            create: {eventId, userId: user.id, days},
            update: {days}
        })
       

        // extract new pref of current user
        const prefs = await prisma.availabilityPreference.findMany({
            where: {eventId},
            select: {userId: true, days: true}
        })
         // recount days and tallies
        const tallies = emptyTallies();

        for(let p of prefs){
            for (let d of p.days){
                tallies[d]= (tallies[d]??0)+1;
            }
        }

        const topDays = computeTopDays(tallies);
        return {myDays: days, tallies, topDays}
    }


}