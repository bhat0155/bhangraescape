import { Router } from "express";
import { validate } from "../middlewares/validate";
import { authSession, requiredRole } from "../middlewares/auth";
import {finalMixController} from "../controllers/finalmix.controller";
import { eventIdParamFinalMix, setFinalMixBody } from "../schemas/finalmix.schemas";


export const finalMixRouter = Router();

// get final mix
finalMixRouter.get("/events/:eventId/final-mix",(req, res, next) => validate(req, res, next, eventIdParamFinalMix) ,finalMixController.get);


// create final mix
finalMixRouter.put("/events/:eventId/final-mix", authSession, requiredRole(["ADMIN"]),(req, res, next) => validate(req, res, next, setFinalMixBody) ,finalMixController.create);

//clear final mix
finalMixRouter.delete("/events/:eventId/final-mix", authSession, requiredRole(["ADMIN"]),(req, res, next) => validate(req, res, next, eventIdParamFinalMix) ,finalMixController.clear);