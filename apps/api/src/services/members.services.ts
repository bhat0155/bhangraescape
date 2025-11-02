import { createMemberBodyType } from "../schemas/members.schemas";
import { prisma } from "../lib/prisma";

type Role = "ADMIN"| "MEMBER"| "GUEST";

const userSelect ={
                id: true,
                name: true,
                avatarUrl: true,
                description: true,
                role: true,
                createdAt: true,
                updatedAt: true
}

export const memberService = {
    async list(){
     return  await prisma.user.findMany({
            where: {role: {in: ["MEMBER","ADMIN"]}},
            select: userSelect,
            orderBy: {createdAt: "desc"}        
       })
    },

    async getMember(memberId: string){
       return await prisma.user.findUnique({
            where: {id: memberId},
            select: userSelect
        })
    },

    async createMember(data: createMemberBodyType){
        return prisma.user.create({ 
            data: {
                ...data,
                role: "MEMBER"
            },
             select: userSelect
        })
    },

    async patch(memberId: string, partial: {name?:string, avatarUrl?: string, description?: string}){
        try{
          const  updated = await prisma.user.update({
            where: {id: memberId},
            data: {
                ...(partial.name!==undefined ? {name: partial.name}:{}),
                ...(partial.avatarUrl!==undefined ? {avatarUrl: partial.avatarUrl}:{}),
                ...(partial.description!==undefined ? {description:partial.description}:{})
            },
            select: userSelect
          })
          return updated;
        }catch(err:any){
            if(err.code == "P2025"){
                const e: any = new Error("Member not found");
                e.status = 404;
                throw e;
            }
            throw err;
        }
    },
       // update role
    async promote(memberId: string, role: Role){
        try{
            const updated = await prisma.user.update({
                where: {id: memberId},
                data: {role},
                select: userSelect
            })
            return updated;
        }catch(err: any){
            if(err.code == "P2025"){
                const e: any = new Error("Member not found");
                e.status=404;
                throw e;
            }
            throw err;
        }
    },


    async remove(memberId: string){
        const {count}= await prisma.user.deleteMany({
            where: {id: memberId},
        })
        if(count == 0){
            const e: any = new Error("User not found");
            e.status=404;
            throw e;
        }
        return {success: true, message: "user deleted"};
    }

 
}