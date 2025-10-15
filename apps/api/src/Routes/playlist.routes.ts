import { Router } from "express";
import { validate } from "../middlewares/validate";
import { authSession, requiredRole } from "../middlewares/auth";
import { playlistController } from "../controllers/playlist.controller";
import { createPlaylistBody, deletePlaylistParams, listPlaylistParams, patchPlaylistBodyAndParams } from "../schemas/playlist.schema";

export const playlistRouter = Router();

// get playlist for specific event
playlistRouter.get("/events/:eventId/playlist", (req, res, next) => validate(req, res, next,listPlaylistParams), playlistController.list);


// create playlist
playlistRouter.post("/events/:eventId/playlist", authSession, requiredRole(["ADMIN"]), (req, res, next) => validate(req, res, next, createPlaylistBody), playlistController.create);

// update playlist
playlistRouter.patch("/playlist/:playlistId", authSession, requiredRole(["ADMIN"]), (req, res, next) => validate(req, res, next, patchPlaylistBodyAndParams), playlistController.patch);


// delete playlist
playlistRouter.delete("/playlist/:playlistId", authSession, requiredRole(["ADMIN"]), (req, res, next) => validate(req, res, next, deletePlaylistParams), playlistController.delete);