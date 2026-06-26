import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpstatus from "http-status"

const loginUser = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{

    const payload = req.body;

    const {accessToken,refreshToken} = await authService.loginUser(payload)

    res.cookie("accessToken",accessToken,{
        httpOnly:true,
        secure: false,
        sameSite: "none",
        maxAge:1000*60*60*24 // 24 hours or 1 day
    });

    res.cookie("refreshToken",refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000*60*60*24*7     // 7 days
    });

    sendResponse(res,{
        success: true,
        statusCode: httpstatus.OK,
        message: "User loogged in Successfully",
        data: {accessToken,refreshToken}
    })
})

export const authController ={
    loginUser
}