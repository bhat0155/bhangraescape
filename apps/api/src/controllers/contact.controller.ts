import type {Request, Response, NextFunction} from "express";
import { contactService } from "../services/contact.services";

export const contactControlller = {
    async submit(req: Request, res: Response, next: NextFunction){
        try{
            const {name, email, message}= (req as any).body ?? req.body;
            const result = await contactService.submitMessage({name, email, message})
            res.status(202).json(result)
        }catch(err){
            next(err)
        }
    }
}