
import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import { ses } from "../lib/ses";
import { da } from "zod/v4/locales";

const SES_FROM = process.env.SES_FROM!;
const ADMIN_NOTIFY = process.env.ADMIN_NOTIFY!; // single or comma-separated

if (!SES_FROM) throw new Error("SES_FROM is required");
if (!ADMIN_NOTIFY) throw new Error("ADMIN_NOTIFY is required");

function toAddresses() {
  return ADMIN_NOTIFY.split(",").map(s => s.trim()).filter(Boolean);
}

// function to send emails for join-team
export async function sendContactUsEmail(input: {
  name: string;
  email: string;
  message: string;
}) {
  const to = toAddresses();
  const subject = `Contact Us: ${input.name} <${input.email}>`;
  const text = `New Contact Us submission

Name: ${input.name}
Email: ${input.email}

Message:
${input.message}
`;

  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
      <h2>New Contact Us submission</h2>
      <p><b>Name:</b> ${escapeHtml(input.name)}</p>
      <p><b>Email:</b> ${escapeHtml(input.email)}</p>
      <p><b>Message:</b></p>
      <pre style="white-space:pre-wrap">${escapeHtml(input.message)}</pre>
    </div>
  `;

  const cmd = new SendEmailCommand({
    FromEmailAddress: SES_FROM,
    Destination: { ToAddresses: to },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Text: { Data: text, Charset: "UTF-8" },
          Html: { Data: html, Charset: "UTF-8" },
        },
      },
    },
  });

  await ses.send(cmd);
}

/** minimal HTML escaping */
function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// function to send emails for join-team
export async function sendJoinRequestEmail(params: {
    name?: string | null;
    email: string
}){
    const {name, email} = params;
    const to = ADMIN_NOTIFY.split(",").map(s => s.trim()).filter(Boolean);
    const subject = "New Join Team Request";
    const bodyText = `${email} wants to join the team ${name? `(name: ${name})`:""}.`
    const bodyHtml = `
    <p><strong>${email}</strong> wants to join the team${name ? ` (name: ${name})` : ""}.</p>
  `;

  const cmd = new SendEmailCommand({
    FromEmailAddress: SES_FROM,
    Destination: {ToAddresses: to},
    Content: {
        Simple: {
            Subject: {Data: subject},
            Body: {
                Text: {Data: bodyText},
                Html: {Data: bodyHtml}
            }
        }
    }
  })

  await ses.send(cmd)
}