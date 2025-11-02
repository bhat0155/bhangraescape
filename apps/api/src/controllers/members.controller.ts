import type {Request, Response, NextFunction} from "express";
import { memberService } from "../services/members.services";

export const membersController = {
    async list(req: Request, res: Response, next: NextFunction){
        try{
           const result = await memberService.list();
           return res.json(result)
        }catch(err){
            next(err)
        }
    },

    async get(req: Request, res: Response, next: NextFunction){
        try{
            const {params}= (req as any).validated ?? {params: req.params};
            const user = await memberService.getMember(params.memberId);
            if(!user){
                return res.status(404).json({error: "user not found"})
            }
            res.json(user);
        }catch(err){
            next(err)
        }
    },

    async create(req: Request, res: Response, next: NextFunction){
        try{
            const {body}  = (req as any).validated ?? {body: req.body};
            const data = await memberService.createMember(body)
            res.status(201).json(data)
        }catch(err){
            next(err)
        }
    },

    async patch(req: Request, res: Response, next: NextFunction){
        try{
            const {params, body}=(req as any).validated ?? {params: req.params, body: req.body}
            const data = await memberService.patch(params.memberId, body);
            res.json(data);
        }catch(err){
            next(err)
        }
    },

    async promote(req: Request, res: Response, next: NextFunction){
        try{
            const {params, body}= (req as any).validated ?? {params: req.params, body: req.body};
            const data = await memberService.promote(params.memberId, body.role);
            res.status(200).json({ status: "success", data });
        }catch(err){
            next(err)
        }
    },

    async delete(req: Request, res: Response, next: NextFunction){
        try{
            const {params} = (req as any).validated ?? {params:req.params};
            const result = await memberService.remove(params.memberId);
             if (!result) {
                     return res.status(404).json({ error: "user not found" });
                 }
            res.json(result);
        }catch(err){
            next(err)
        }
    }

}