import { s3, S3_BUCKET } from "../lib/s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { prisma } from "../lib/prisma";


const mediaSelect = {
  id: true,
  eventId: true,
  type: true,       // "IMAGE" | "VIDEO"
  source: true,     // "S3"
  url: true,
  title: true,
  createdAt: true,
} as const;

type PresignOpts = {
  prefix: "avatars" | "events";        // keep it constrained
  contentType: string;                  // e.g. "image/jpeg" or "image/png"
  maxSizeMb?: number;                   // default 5 MB
  ext?: string;                         // optional file extension
  userId: string;                       // to namespace keys by user
};

type RegisterMediaInput = {
  eventId: string;
  fileKey: string;
  type: "IMAGE" | "VIDEO";
  title?: string;
}
export async function presignUpload({
  prefix,
  contentType,
  maxSizeMb = 100,
  ext,
  userId,
}: PresignOpts) {
  const id = nanoid(16);
  const safeExt = ext?.replace(/[^a-z0-9.]/gi, "") || "";
  const key = `${prefix}/${userId}/${id}${safeExt ? `.${safeExt}` : ""}`;

  const maxBytes = maxSizeMb * 1024 * 1024;

  const { url, fields } = await createPresignedPost(s3, {
    Bucket: S3_BUCKET,
    Key: key,
    Conditions: [
      ["content-length-range", 1, maxBytes],
      ["starts-with", "$Content-Type", contentType.split("/")[0] + "/"], // lock to image/*
    ],
    Fields: {
      "Content-Type": contentType,
      // Optional: enforce ACL if your bucket requires it
      // "acl": "public-read",
    },
    Expires: 300, // seconds to use the form
  });

  // Public URL you can store in DB (your bucket is public)
  const publicUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { url, fields, key, publicUrl, expiresIn: 300 };
}

export async function registerMedia({eventId, fileKey, type, title}: RegisterMediaInput){
    const publicUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    const media = await prisma.media.create({
      data:{
        eventId,
        type,
        source: "S3",
        url: publicUrl,
        title: title ?? null
      },
      select: {
      id: true,
      eventId: true,
      type: true,
      source: true,
      url: true,
      title: true,
      createdAt: true,
    },
    })
    return media;
}

export async function listMediaByEventServices(eventId: string){
  return await prisma.media.findMany({
    where: {eventId},
    select: mediaSelect,
    orderBy: {createdAt: "desc"}
  })
}

export async function patchMediaService(mediaId: string, partial: {title?: string, type?: "IMAGE" | "VIDEO"}){
  // guard: only allow title and type to be updated
  const data: Record<string, any> ={}
    if(partial.title !== undefined) data.title = partial.title ?? null;
    if(partial.type !== undefined) data.type = partial.type;

    if (Object.keys(data).length === 0){
      const e: any = new Error("No valid fields to update")
        e.status = 422;
        throw e;
    }

    const {count}=await prisma.media.updateMany({
      where: {id: mediaId},
      data
    })

    if(count === 0){
      const e: any = new Error("Media not found");
      e.status = 404;
      throw e;
    }

    // return the updated media
    return await prisma.media.findUnique({
      where: {id: mediaId},
      select: mediaSelect
    })
  
}

function keyFromUrl(url: string){
  const region = process.env.AWS_REGION;
 const prefix = `https://${S3_BUCKET}.s3.${region}.amazonaws.com/`;
 if(!url.startsWith(prefix)){
  const e: any = new Error("stored media url is not public s3 url");
  e.status = 500;
  throw e;
 }
 return url.slice(prefix.length);

}

export async function deleteMediaService(mediaId: string){
  // get the media record
  const media = await prisma.media.findUnique({
    where: {id: mediaId},
    select: {id: true, url: true}
  })
  if(!media){
    const e: any = new Error("Media not found");
    e.status = 404;
    throw e;
  }
  // remove from s3
  const key = keyFromUrl(media.url);
  try{
        await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));

  }catch(err){
    const e:any = new Error(`Failed to delete media from storage", ${err}`);
    e.status = 502;
    throw e;
  }

  // finally remove from db

  await prisma.media.delete({
    where: {id: mediaId}
  })
  return {deleted: true, deletedId: mediaId}
}