import { Router } from "express";
import { validate } from "../middlewares/validate";
import { membersController } from "../controllers/members.controller";
import { listMembersQuery, memberIdParam, createMemberBody, patchMemberBodyAndParams, updateRoleBodyAndParams } from "../schemas/members.schemas";
import { authSession, requiredRole } from "../middlewares/auth";

export const memberRouter = Router();

// public routes
memberRouter.get("/", (req, res, next)=> validate(req, res, next, listMembersQuery), membersController.list);
memberRouter.get("/:memberId", (req,res,next)=> validate(req,res,next, memberIdParam), membersController.get);

// admin routes
memberRouter.post("/", authSession, requiredRole(["ADMIN"]),(req,res,next)=> validate(req,res,next, createMemberBody), membersController.create);
memberRouter.patch("/:memberId",authSession, requiredRole(["ADMIN"]), (req,res,next)=> validate(req,res,next, patchMemberBodyAndParams), membersController.patch);
memberRouter.delete("/:memberId", authSession, requiredRole(["ADMIN"]),(req,res,next)=> validate(req,res,next, memberIdParam), membersController.delete);
memberRouter.patch("/:id/role",authSession, requiredRole(["ADMIN"]), (req,res,next)=> validate(req,res,next,updateRoleBodyAndParams ), membersController.promote);
