import type {Request, Response, NextFunction} from "express";
import { memberService } from "../services/members.services";

export const membersController = {
    async list(req: Request, res: Response, next: NextFunction){
        try{
            const {search} = (req as any).query ?? req.query;
            const items = await memberService.list({search});
            res.json({items});
        }catch(err){
            next(err)
        }
    },

    async get(req: Request, res: Response, next: NextFunction){
        try{
            const {memberId}= (req as any).params ?? req.params;
            const data = await memberService.get(memberId);
            res.json(data);
        }catch(err){
            next(err)
        }
    },

    async create(req: Request, res: Response, next: NextFunction){
        try{
            const {name, avatarUrl, description } = (req as any).body ?? req.body;
            const data = await memberService.create({name, avatarUrl, description})
            res.status(201).json(data)
        }catch(err){
            next(err)
        }
    },

    async patch(req: Request, res: Response, next: NextFunction){
        try{
            const {memberId}= (req as any).params ?? req.params;
            const partial = (req as any).body ?? req.body;
            const data = await memberService.patch(memberId, partial);
            res.json(data);
        }catch(err){
            next(err)
        }
    },

    async delete(req: Request, res: Response, next: NextFunction){
        try{
            const {memberId} = (req as any).params ?? req.params;
            const result = await memberService.remove(memberId);
            res.json(result);
        }catch(err){
            next(err)
        }
    }

}