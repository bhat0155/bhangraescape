import { Request, Response, NextFunction} from "express";
import {finalMixService} from "../services/finalmix.services"

export const finalMixController = {
    async get(req: Request, res: Response, next: NextFunction){
        try{
            const {eventId}=(req as any).validated.params ?? req.params;
            const item = await finalMixService.get(eventId);
            // cache
            res.setHeader("Cache-Control", "public, max-age=60");
            return res.json({item})
        }catch(err){
            next(err)
        }
    },

    async create(req: Request, res: Response, next: NextFunction){
        try{
            const {params, body}=(req as any).validated ?? {parrams: req.params, body: req.body};
            const item = await finalMixService.set(params.eventId, body)
            return res.status(201).json(item)
        }catch(err){
            next(err)
        }

    },

    async clear(req: Request, res: Response, next: NextFunction){
        try{
            const {eventId} = (req as any).validated.params ?? req.params;
            const result = await finalMixService.clear(eventId);
            return res.status(204).send();
        }catch(err){
            next(err)
        }
    }   
}