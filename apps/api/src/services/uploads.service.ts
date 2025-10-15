import { s3, S3_BUCKET } from "../lib/s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
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
  maxSizeMb = 5,
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