import { Router } from "express";
import { validate } from "../middlewares/validate";
import { joinRequestController } from "../controllers/joinRequest.controller";
import {submitJoinBody, listJoinRequestQuery, reviewJoinParams, reviewJoinBody} from "../schemas/join.schemas"

export const joinRouter = Router();

// submit a join request
joinRouter.post("/join-team", (req,res,next)=> validate(req,res,next,submitJoinBody), joinRequestController.submit);

// list join requests, admins can filter by status
joinRouter.get("/join-requests", (req,res,next)=> validate(req,res,next,listJoinRequestQuery), joinRequestController.list);

// review a join request by id, either approve or reject
joinRouter.post("/join-requests/:id", (req,res,next)=> validate(req,res,next,reviewJoinParams), (req,res,next)=> validate(req,res,next,reviewJoinBody), joinRequestController.review);