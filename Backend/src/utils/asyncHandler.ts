import { NextFunction, Request, Response } from "express";

export const asyncHandler = (fn: (req: any, res: Response, next: NextFunction)=>Promise<any>)=>
    async(req: Request, res: Response, next: NextFunction)=>{
        try{
            await fn(req,res,next);
        }catch(error){
            next(error)
        }
    }
