import rateLimit from "express-rate-limit";

export const limitContact = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {error: "Too many requests, please try again after 10 mins."}
})

export const limitJoinTeam = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {error: "Too many requests, please try again after 10 mins."}
})

//TODO add redis in production for rate limit