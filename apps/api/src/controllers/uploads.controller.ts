import type { Request, Response, NextFunction } from "express";
import { presignUpload, registerMedia } from "../services/uploads.service";


export async function presigned(req: Request, res: Response, next: NextFunction){
    try{
        const user = (req as any).user;
        if(!user.id){
           return res.status(401).json("Please sign in to upload")
        }

        const {prefix = "avatars", contentType, ext} = req.body || {};
        if (!contentType) return res.status(422).json({ error: "contentType required" });
        const data = await presignUpload({
            prefix,
            contentType,
            ext,
            userId: user.id
        })
    res.json(data);

    }catch(err){
        next(err)
    }
}

export async function registerEventMedia(req: Request, res: Response, next: NextFunction){
    try{
        const {params, body} = (req as any).validated ?? {params: req.params, body: req.body};
        const media = await registerMedia({
            eventId: params.eventId,
            fileKey: body.fileKey,
            type: body.type,
            title: body.title
        })
        res.status(201).json(media)
    }catch(err){
        next(err)
    }
}