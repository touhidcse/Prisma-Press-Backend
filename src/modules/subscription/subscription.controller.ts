import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";

const createCheckoutSession = catchAsync(
    async (req: Request, res: Response, nex: NextFunction)=>{

    }
);


export const subscriptionController = {
    createCheckoutSession,
}