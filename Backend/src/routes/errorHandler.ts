import { NextFunction, Request, Response } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction)=>{
    console.error(err);
    res.status(500).json({
        error: "Something went wrong"
    })
};