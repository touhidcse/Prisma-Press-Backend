import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpstatus from "http-status"
import { premiumServices } from "./premium.service";

const getPremiumContent = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const query = req.query;
        const result = await premiumServices.getPremiumContent(query)
        
        sendResponse(res,{
            success: true,
            statusCode: httpstatus.OK,
            message: "Premium content retrieved Successfully",
            data: result.data,
            meta: result.meta
        })
    }
);


export const premiumController = {
    getPremiumContent
}