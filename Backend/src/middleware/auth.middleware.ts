import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction)=>{
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({
            msg: "Token missing"
        });
    }
    const jwtToken = token.split(" ")[1];

    try{
        const decoded = jwt.verify(jwtToken, JWT_SECRET) as {
            userId: string;
            email: string;
        };
        req.userId = decoded.userId;
        req.email = decoded.email;
        next();
    }catch(error){
        return res.status(401).json({ msg: "Invalid Token"})
    }
};