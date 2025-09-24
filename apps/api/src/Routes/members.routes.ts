import { Router } from "express";
import { validate } from "../middlewares/validate";
import { membersController } from "../controllers/members.controller";
import { listMembersQuery, memberIdParam, createMemberBody, updateMember } from "../schemas/members.schemas";

export const memberRouter = Router();

// public routes
memberRouter.get("/", (req, res, next)=> validate(req, res, next, listMembersQuery), membersController.list);
memberRouter.get("/:memberId", (req,res,next)=> validate(req,res,next, memberIdParam), membersController.get);

// admin routes
memberRouter.post("/", (req,res,next)=> validate(req,res,next, createMemberBody), membersController.create);
memberRouter.patch("/:memberId", (req,res,next)=> validate(req,res,next, updateMember), membersController.patch);
memberRouter.delete("/:memberId", (req,res,next)=> validate(req,res,next, memberIdParam), membersController.delete);