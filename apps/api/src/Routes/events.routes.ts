import {Router} from "express";
import { validate } from "../middlewares/validate";
import { createEventBody, toggleInterestSchema, getEventParams, getAvailabilityParams, setAvailabilityParams, eventIdParam, patchEventBodyAndParams, deleteEventParams } from "../schemas/events.schemas";
import { eventController } from "../controllers/events.controller";
import { authSession, requiredRole } from "../middlewares/auth";

export const eventRouter = Router();

eventRouter.post("/", authSession, requiredRole(["ADMIN"]), (req, res, next)=> validate(req, res, next, createEventBody), eventController.createEvent);
// eventRouter.get("/:eventId", (req, res, next)=> validate(req, res,next,eventIdParam), eventController.getOne); //TODO to be deleted soon

// update event route
eventRouter.patch("/:eventId", authSession, requiredRole(["ADMIN"]),(req,res,next)=>validate(req,res,next,patchEventBodyAndParams),eventController.update)

// delete event
eventRouter.delete("/:eventId", authSession, requiredRole(["ADMIN"]), (req,res,next)=> validate(req,res,next,deleteEventParams), eventController.deleteEvent)

// events detail, with user context if logged in
eventRouter.get("/:eventId", authSession, (req, res, next)=> validate(req,res,next, getEventParams), eventController.getEventDetail);

// toggle interest in event, with user context
eventRouter.post("/:eventId/interest", authSession, requiredRole(["MEMBER","ADMIN"]), (req, res, next)=> validate(req,res,next,toggleInterestSchema),eventController.toggleInterest);

// get availability
eventRouter.get("/:eventId/availability",authSession, (req,res,next)=> validate(req,res,next,getAvailabilityParams), eventController.getAvailability);

// set availability
eventRouter.post("/:eventId/availability",authSession,
  requiredRole(["MEMBER","ADMIN"]), (req,res,next)=>validate(req,res,next,setAvailabilityParams), eventController.setAvailability)