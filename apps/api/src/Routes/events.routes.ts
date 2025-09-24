import {Router} from "express";
import { validate } from "../middlewares/validate";
import { createEventBody, eventIdParam, getEventParams } from "../schemas/events.schemas";
import { eventController } from "../controllers/events.controller";

export const eventRouter = Router();

eventRouter.post("/", (req, res, next)=> validate(req, res, next, createEventBody), eventController.createEvent);
// eventRouter.get("/:eventId", (req, res, next)=> validate(req, res,next,eventIdParam), eventController.getOne); to be deleted soon

// events detail, with user context if logged in
eventRouter.get("/:eventId", (req, res, next)=> validate(req,res,next, getEventParams), eventController.getEventDetail);