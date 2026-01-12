import { rateLimit } from "express-rate-limit";

export const signupLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      error: "Too many requests. Please try again later."
    });
  }
});

export const signinLimiter = rateLimit({
    windowMs: 60*1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req,res)=>{
        return res.status(429).json({
            error: "Too many requests. Please try again later"
        })
    }
})
