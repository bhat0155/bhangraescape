import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errors';
import { eventRouter } from './Routes/events.routes';
import { memberRouter } from './Routes/members.routes';
import { contactRouter } from './Routes/contact.route';
import { joinRouter } from './Routes/join.routes';
import { devRouter } from './Routes/auth.route';
import {uploadRouter} from './Routes/uploads.route'
import { playlistRouter } from './Routes/playlist.routes';
import {finalMixRouter} from './Routes/finalmix.route';
import { bearerAuth } from './middlewares/bearAuth';
import adminRouter from './Routes/admin.route';

const devOrigin = process.env.NEXT_DEV_ORIGIN ?? 'http://localhost:3000';

// loads env
dotenv.config();
const app = express();
// Behind Render/Vercel proxies we must trust the forwarded headers so rate limiting
// and IP lookups work correctly.
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : 0);
app.use(helmet({
    crossOriginResourcePolicy: {policy: "cross-origin"}
}));  // security headers

app.use(cors({
    origin: ['https://bhangrascape.ca', 'https://www.bhangrascape.ca', devOrigin],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json()); // for parsing application/json
app.use(morgan("dev")); // logging
app.use(bearerAuth)

// routes
app.use("/api/events", eventRouter);
app.use("/api/members", memberRouter)
app.use("/api", contactRouter);
app.use("/api", joinRouter);
app.use("/api",devRouter)
app.use("/api/uploads", uploadRouter)
app.use("/api", playlistRouter)
app.use("/api", finalMixRouter)
app.use("/api/admin", adminRouter)


app.use(errorHandler);

// creating a health route
app.get("/health", (req: Request, res:Response)=>{
    res.json({ok: true})
})

const PORT = process.env.PORT || 4000;


app.listen(PORT, ()=>{
    console.log("API server is running on port", PORT);
})
