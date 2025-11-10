// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";

// export async function GET(req: Request) {
//   // 1. Log the secret loading status (NEVER log the secret value itself!)
//     console.log('API Secret Loaded Status:', process.env.NEXTAUTH_SECRET ? 'Secret Found' : 'Secret Missing');

//     // Convert the Headers object into a plain JavaScript object for logging
//     const headersObject: Record<string, string> = {};
//     for (const [key, value] of req.headers.entries()) {
//         headersObject[key] = value;
//     }
    
//     // 2. Log all incoming headers, confirming if the 'cookie' header is present
//     console.log('--- Incoming Request Headers ---');
//     console.log(JSON.stringify(headersObject, null, 2));
//     console.log('------------------------------');
    
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, raw: true });
//   // Also log the final outcome of getToken
// console.log('getToken Result:', token ? 'SUCCESS: Token Retrieved' : 'FAILURE (token is null)');
//   return NextResponse.json({ token });
// }

// apps/web/bhangraescape/app/api/dev/jwt/route.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
    // 1. Convert Headers to a plain object
    const headersObject: Record<string, string> = {};
    for (const [key, value] of req.headers.entries()) {
        headersObject[key] = value;
    }
    
    // 2. Attempt to retrieve the token (still necessary for full context)
    const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET, 
        raw: true 
    });

    // 3. Return the headers and the token result directly in the response
    return NextResponse.json({ 
        status: token ? "SUCCESS: Token Found" : "FAILURE: Token is null",
        token: token,
        // Crucially, show all headers received by the function
        receivedHeaders: headersObject 
    });
}