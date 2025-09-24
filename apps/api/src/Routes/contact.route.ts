import { Router } from "express";
import { validate } from "../middlewares/validate";
import { contactControlller } from "../controllers/contact.controller";
import { submitContactBody } from "../schemas/contacts.schemas";

export const contactRouter = Router();

contactRouter.post("/contactus", (req, res, next)=> validate(req, res,next,submitContactBody), contactControlller.submit);