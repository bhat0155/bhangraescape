import {prisma} from "../lib/prisma";
import {ReviewJoinBodyType, SubmitJoinBodyType, JoinTeamIdParamType } from "../schemas/join.schemas"

const joinSelect = {
    id: true,
    userId: true,
    name: true,
    email: true,
    message: true,
    status: true,
    createdAt: true,
    reviewedAt: true,
} as const;

export const joinService = {
    // create or return existing pending request for a user
    // if request exists, return it

    async submitJoinRequest(user: {id: string, name?: string, email?: string}){
        const userId=user.id;
        const name = user.name ?? "";
        const email = user.email ?? "";

        // check if pending req for user exist
        const existingReq = await prisma.joinRequest.findFirst({
            where: {userId, status: "PENDING"},
            select: joinSelect
        })

        if (existingReq) return existingReq;

        // if no record found, create a request
        const created = await prisma.joinRequest.create({
            data:{
                userId,
                name,
                email,
                status: "PENDING"
            },
            select: joinSelect
        })
        // SES admins can be triggered here
        return created;
    },

    // list pending request for the admins to review
    async listPending(){
        return prisma.joinRequest.findMany({
            where:{status: "PENDING"},
            select: joinSelect,
            orderBy: {createdAt: "desc"}
        })
    },

    //admin action
    // if approved, set user to member
    async review(id: string, body: ReviewJoinBodyType){
        const action = body.action;
       
        // fetch the exsiting request to get userId and validate its existance
        const joinRequest = await prisma.joinRequest.findUnique({
            where: {id},
            select: {id: true, userId: true}
        })
        if(!joinRequest){
            const e:any = new Error("Join Request not found");
            e.status = 404;
            throw e;
        }

        // if approved changed role of user to member
        if(action == "APPROVED"){
            // use transaction to make sure both join req and user is updated
            const [updatedRequest, _user] = await prisma.$transaction([
                // update join request
                 prisma.joinRequest.update({
                    where: {id},
                    data: {status: "APPROVED", reviewedAt: new Date()},
                    select: joinSelect
                }),
                // update user to be a member
                 prisma.user.update({
                    where: {id: joinRequest.userId},
                    data: {role: "MEMBER"}
                }),
            ]);
            return updatedRequest;
        }

        // if rejected only update join request
        if(action == "REJECTED"){
           const rejected=  await prisma.joinRequest.update({
                where: {id},
                data: {status:"REJECTED",reviewedAt: new Date()},
                select: joinSelect
            })
            return rejected;
        }

    }

}