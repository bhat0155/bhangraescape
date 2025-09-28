import { Router } from "express"
import { presigned } from "../controllers/uploads.controller"
import { authSession, requiredRole } from "../middlewares/auth"

export const uploadRouter = Router();

uploadRouter.post("/presign", authSession, presigned)