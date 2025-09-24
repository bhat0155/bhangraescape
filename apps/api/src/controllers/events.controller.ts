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
    }
}