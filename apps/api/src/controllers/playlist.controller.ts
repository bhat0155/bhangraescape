import { Request, Response, NextFunction} from "express";
import { playlistService } from "../services/playlist.services";

export const playlistController = {
    async list(req: Request, res: Response, next: NextFunction){
        try{
            const {eventId}=(req as any).validated.params ?? req.params;
            const items = await playlistService.listByEvent(eventId);
            // cache
            res.setHeader("Cache-Control", "public, max-age=60");
            return res.json({items})
        }catch(err){
            next(err)
        }
    },

    async create(req: Request, res: Response, next: NextFunction){
        try{
            const {params, body}=(req as any).validated ?? {parrams: req.params, body: req.body};
            const item = await playlistService.create(params.eventId, body)
            return res.status(201).json(item)
        }catch(err){
            next(err)
        }

    },

    async patch(req: Request, res: Response, next: NextFunction){
        try{
            const {params, body}=(req as any).validated ?? {parrams: req.params, body: req.body};
            const updated = await playlistService.patch(params.playlistId, body)
            res.json(updated)
        }catch(err){
            next(err)
        }
    },

    async delete(req: Request, res: Response, next: NextFunction){
        try{
            const {playlistId} = (req as any).validated.params ?? req.params;
            const result = await playlistService.delete(playlistId);
            return res.status(204).send();
        }catch(err){
            next(err)
        }
    }
}