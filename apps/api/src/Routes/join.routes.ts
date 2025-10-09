import { Router } from "express";
import { validate } from "../middlewares/validate";
import { joinRequestController } from "../controllers/joinRequest.controller";
import {submitJoinBody, joinTeamIdParam, reviewJoinBody, ListPendingJoinRequestsBody, reviewJoinRequestSchema} from "../schemas/join.schemas"
import { authSession, requiredRole } from "../middlewares/auth";
import { limitJoinTeam } from "../middlewares/rateLimit";

export const joinRouter = Router();

// submit a join request
joinRouter.post("/join-team", authSession, limitJoinTeam, (req,res,next)=> validate(req,res,next,submitJoinBody), joinRequestController.submit);

// list join requests, admins can filter by status
joinRouter.get("/join-requests", authSession, requiredRole(["ADMIN"]), (req,res,next)=> validate(req,res,next,ListPendingJoinRequestsBody), joinRequestController.list);

// review a join request by id, either approve or reject
joinRouter.post("/join-requests/:id",  authSession, requiredRole(["ADMIN"]), (req,res,next)=> validate(req,res,next,reviewJoinRequestSchema), joinRequestController.review);