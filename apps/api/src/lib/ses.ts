import { SESv2Client } from "@aws-sdk/client-sesv2";

if(!process.env.AWS_REGION){
    throw new Error("AWS region is required for SES")
}

export const ses = new SESv2Client({
    region: process.env.AWS_REGION,

})