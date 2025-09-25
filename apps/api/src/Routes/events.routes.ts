import {Router} from "express";
import { validate } from "../middlewares/validate";
import { createEventBody, toggleInterestSchema, getEventParams, getAvailabilityParams, setAvailabilityParams } from "../schemas/events.schemas";
import { eventController } from "../controllers/events.controller";
import { authSession, requiredRole } from "../middlewares/auth";

export const eventRouter = Router();

eventRouter.post("/", (req, res, next)=> validate(req, res, next, createEventBody), eventController.createEvent);
// eventRouter.get("/:eventId", (req, res, next)=> validate(req, res,next,eventIdParam), eventController.getOne); to be deleted soon

// events detail, with user context if logged in
eventRouter.get("/:eventId", (req, res, next)=> validate(req,res,next, getEventParams), eventController.getEventDetail);

// toggle interest in event, with user context
eventRouter.post("/:eventId/interest", authSession, requiredRole(["MEMBER","ADMIN"]), (req, res, next)=> validate(req,res,next,toggleInterestSchema),eventController.toggleInterest);

// get availability
eventRouter.get("/:eventId/availability",authSession, (req,res,next)=> validate(req,res,next,getAvailabilityParams), eventController.getAvailability);

// set availability
eventRouter.post("/:eventId/availability",authSession,
  requiredRole(["MEMBER","ADMIN"]), (req,res,next)=>validate(req,res,next,setAvailabilityParams), eventController.setAvailability)