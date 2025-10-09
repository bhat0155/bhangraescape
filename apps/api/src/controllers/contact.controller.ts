import type {Request, Response, NextFunction} from "express";
import { contactServices } from "../services/contact.services";
import { sendContactUsEmail } from "../services/email.service";

export const contactControlller = {
    async submit(req: Request, res: Response, next: NextFunction){
        try{
            const {body}= (req as any).validated;
            const {name, email, message} = body;

            // send SES to admin
            await sendContactUsEmail({name, email, message})
            const result = await contactServices.submitContact(body)
           return res.status(202).json({
              status: "accepted",
              data: result ?? { name, email, message },
              note: "Email sent to admins via SES",
           })
        }catch(err){
            next(err)
        }
    }
}