import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

async function main(){
    // create an admin user
    const admin = await prisma.user.upsert({
        where: {email: "admin@bhangraescape.com"},
        update: {},
        create: {
            name: "Admin User",
            email: "admin@bhangraescape.com",
            role: "ADMIN",
            avatarUrl: "https://placehold.co/100x100",
            description: "The mighty admin"
        }
    })

    // create a member
    const member = await prisma.user.upsert({
        where: {email: "member@bhangraescape.com"},
        update: {},
        create: {
            name: "Member User",
            email: "member@bhangraescape.com",
            role: "MEMBER",
            avatarUrl: "https://placehold.co/100x100",
            description: "A regular member"
        }
    });

    // create a future event
    const futureEvent = await prisma.event.create({
        data:{
            title: "Diwali 2025",
            date: new Date("2025-11-01"),
            location: "Aroha"
        }
    })

    // create a past event
    const pastEvent = await prisma.event.create({
        data:{
            title: "canadaDay 2025",
            date: new Date("2025-07-01"),
            location: "Anita's office"
        }
    })
    console.log({admin, member, futureEvent, pastEvent})
}

main()
.catch((e)=>{
    console.log(e);
    process.exit(1);
}).finally(async ()=>{
    await prisma.$disconnect();
})