import { Request, Response, NextFunction } from "express";
import { listEligiblePerformers, setPerformersForEvent } from "../services/performers.service";

export async function getEligiblePerformers(req: Request, res: Response, next: NextFunction){
    try{
        const users = await listEligiblePerformers();
        res.json({items: users})
    }catch(err){
        next(err)
    }
}

export async function putEventPerformers(req: Request, res: Response, next: NextFunction){
    try{
        const eventId = (req as any).validated?.params?.eventId ?? req.params.eventId;
        const userIds = (req as any).validated?.body?.userIds ?? req.body.userIds ?? [];
        const result = await setPerformersForEvent(eventId, userIds);
        res.json(result)
    }catch(err){
        next(err)
    }
}