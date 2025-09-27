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


// loads env
dotenv.config();
const app = express();
app.use(helmet());  // security headers
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use(express.json()); // for parsing application/json
app.use(morgan("dev")); // logging

// routes
app.use("/api/events", eventRouter);
app.use("/api/members", memberRouter)
app.use("/api", contactRouter);
app.use("/api", joinRouter);
app.use("/api",devRouter)


app.use(errorHandler);

// creating a health route
app.get("/health", (req: Request, res:Response)=>{
    res.json({ok: true})
})

const PORT = process.env.PORT || 4000;


app.listen(PORT, ()=>{
    console.log("API server is running on port", PORT);
})
