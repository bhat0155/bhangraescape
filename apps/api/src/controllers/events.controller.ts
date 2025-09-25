import { Request, Response, NextFunction } from "express";
import { eventService } from "../services/events.service";

export const eventController = {
    async createEvent(req: Request, res: Response, next: NextFunction){
        try{
            // get info from req.body, pass to service
            const {title, description, date}= req.body;
            const result = await eventService.createEvent({title, description, date});
            res.status(201).json(result);
        }catch(err){
            next(err); // pass to general error handler
        }
    },
    
    async getOne(req: Request, res:Response, next: NextFunction){
        try{
            const {eventId} = (req as any).params ?? req.params;
            const result = await eventService.getOne(eventId);
            res.json(result);
        }catch(err){
            next(err)
        }
    },

    async getEventDetail(req: Request, res: Response, next: NextFunction){
        try{
            const {params}=(req as any).validated ?? {params: req.params};
            const user = (req as any).user ?? null;
            const data = await eventService.getEventDetail(params.eventId, user);
            res.json(data)
        }catch(err){
            next(err)
        }
    },

    async toggleInterest(req: Request, res: Response, next: NextFunction){
        try{
            const {params, body}=(req as any).validated ?? {params: req.params, body: req.body}
            const user = (req as any).user ?? { id: "stub-user", role: "MEMBER" }
            console.log("Toggling interest for user", user, "event", params.eventId, "interested?", body.interested);
            const result = await eventService.toggleInterest(user, params.eventId, body.interested);
            res.json(result);
        }catch(err){
            next(err)
        }
    },

    async getAvailability(req:Request, res: Response, next: NextFunction){
        try{
            const {params}= (req as any).validated ?? {params: req.params}
            const user=(req as any).user ?? null;
            const data = await eventService.getAvailability(params.eventId, user);
            res.json(data)
        }catch(err){
            next(err)
        }
    },

    async setAvailability(req: Request, res: Response, next: NextFunction){
        try{
            const {params,body}=(req as any).validated ?? {params: req.params, body: req.body};
            const user = (req as any).user;
            const data= await eventService.setAvailability(user, params.eventId, body.days)
            console.log(`the eventId for set availability is ${params.eventId}`)
            res.json(data)
        }catch(err){
            next(err)
        }
    }


}