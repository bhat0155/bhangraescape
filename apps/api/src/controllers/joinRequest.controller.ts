import { Request, Response, NextFunction } from "express";
import {joinService} from "../services/joinRequest.services"

export const joinRequestController = {
      // Handle "Join Team" request submission by a logged-in user
    async submit(req: Request, res: Response, next: NextFunction){
        try{
            const user = (req as any).user ?? { id: "stub-user", name: "Stub", email: "stub@example.com" };
            const {message}= (req as any).body ?? "I want to join!";
            const result = await joinService.submitJoinRequest(user, message)
            res.status(202).json(result)
        }catch(err){
            next(err)
        }
    },
    // list join request, admins can filter by status "PENDING" | "APPROVED" | "REJECTED"
    async list(req: Request, res: Response, next: NextFunction){
        try{
            const {status}=(req as any).query ?? req.query;
            const result  = await joinService.listJoinRequests(status)
            return res.json(result)
        }catch(err){
            next(err)
        }
    },

    //review a join request by id, either approve or reject
async review(req: Request, res: Response, next: NextFunction){
    try{
        const {id} = (req as any).params ?? req.params;
        const {action} = (req as any).body ?? req.body;
        const result = await joinService.reviewJoinRequest(id, action)
        return res.json(result)
    }catch(err){
        next(err)
    }
}

}