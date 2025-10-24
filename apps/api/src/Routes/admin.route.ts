import { Router } from "express";
import { authSession, requiredRole } from "../middlewares/auth";
import { getEligiblePerformers } from "../controllers/performers.controller";
import { validate } from "../middlewares/validate";

const adminRouter =  Router();

adminRouter.get(
  "/eligible-performers",
  authSession,
 requiredRole(["ADMIN"]),
 getEligiblePerformers
);

export default adminRouter;