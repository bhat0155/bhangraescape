import { Router } from "express"
import { listEventMedia, presigned, registerEventMedia, patchEventMedia, removeEventMedia } from "../controllers/uploads.controller"
import { authSession, requiredRole } from "../middlewares/auth"
import { eventIdParam, presignMediaBody, registerEventMediaBody, patchMediaBodyAndParams, mediaIdParam } from "../schemas/events.schemas";
import { validate } from "../middlewares/validate";

export const uploadRouter = Router();

// will be used for avatar members 
uploadRouter.post("/presign", authSession, presigned)

// media event presign
uploadRouter.post("/:eventId/media/presign", authSession, requiredRole(["ADMIN"]), (req,res,next)=> validate(req,res,next, presignMediaBody), presigned);

// registering uploaded file to db
uploadRouter.post("/:eventId/media", authSession, requiredRole(["ADMIN"]), (req,res,next)=> validate(req,res,next, registerEventMediaBody),registerEventMedia);

// list all media for an event
uploadRouter.get("/:eventId/media", (req,res,next)=> validate(req,res,next, eventIdParam),listEventMedia);

// path media
uploadRouter.patch("/media/:mediaId", authSession, requiredRole(["ADMIN"]),(req,res,next)=> validate(req,res,next, patchMediaBodyAndParams), patchEventMedia);

// delete media
uploadRouter.delete("/media/:mediaId", authSession, requiredRole(["ADMIN"]),(req,res,next)=> validate(req,res,next, mediaIdParam), removeEventMedia)