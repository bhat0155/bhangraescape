import type {Request, Response, NextFunction} from "express";
import { contactServices } from "../services/contact.services";

export const contactControlller = {
    async submit(req: Request, res: Response, next: NextFunction){
        try{
            const {body}= (req as any).validated;
            const result = await contactServices.submitContact(body)
            res.status(202).json(result)
        }catch(err){
            next(err)
        }
    }
}