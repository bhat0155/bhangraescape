import { S3Client } from "@aws-sdk/client-s3";
import { SESv2Client } from "@aws-sdk/client-sesv2";


export const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials:{
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }

})

export const ses = new SESv2Client({
      region: process.env.AWS_REGION!,
      credentials:{
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }

})

export const S3_BUCKET = process.env.S3_BUCKET_NAME!