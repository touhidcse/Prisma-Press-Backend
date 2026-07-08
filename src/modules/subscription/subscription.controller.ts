import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { subscriptionServices } from "./subscription.service";
import { sendResponse } from "../../utils/sendResponse";
import httpstataus from "http-status"

const createCheckoutSession = catchAsync(
    async (req: Request, res: Response, nex: NextFunction)=>{

        const userId = req.user?.id;
        const result = await subscriptionServices.createCheckoutSession(userId as string);
         
        sendResponse(res,{
            success: true,
            statusCode: httpstataus.OK,
            message: "Checkout completed Successfully",
            data: result,
        })

    }
);

const handleWebhook = catchAsync(
    async (req: Request, res : Response, next: NextFunction)=>{
        const event = req.body as Buffer;
        const signature = req.headers['stripe-signature']!;

        const result = await subscriptionServices.handleWebhook(event,signature as string)
        sendResponse(res,{
            success: true,
            statusCode: httpstataus.OK,
            message:"Webhook triggered successfully",
            data: null
        })
    }
)


export const subscriptionController = {
    createCheckoutSession,
    handleWebhook
}