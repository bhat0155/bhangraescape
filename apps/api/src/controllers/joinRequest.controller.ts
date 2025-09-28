import { Request, Response, NextFunction } from "express";
import {joinService} from "../services/joinRequest.services"

export const joinRequestController = {
      // Handle "Join Team" request submission by a logged-in user
    async submit(req: Request, res: Response, next: NextFunction){
        try{
            const user = (req as any).user;
            if(!user.id){
                res.status(401).json({error: "Unauthorized"})
            }
            const result = await joinService.submitJoinRequest(user)
             return res.status(202).json({ status: "queued", request: result });
        }catch(err){
            next(err)
        }
    },
    async list(req: Request, res: Response, next: NextFunction){
        try{
            const result  = await joinService.listPending()
            return res.json(result)
        }catch(err){
            next(err)
        }
    },

    //review a join request by id, either approve or reject
async review(req: Request, res: Response, next: NextFunction){
    try{
        const {body, params}=(req as any).validated;
        const updated = await joinService.review(params.id, body)
        res.json(updated);
    }catch(err){
        next(err)
    }
}

}