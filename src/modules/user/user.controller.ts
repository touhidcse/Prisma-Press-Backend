import { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import config from "../../config";
import httpstatus from "http-status"
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import jwt from "jsonwebtoken";
import { jwtutils } from "../../utils/jwt";



// const registerUser = async (req: Request, res: Response) => {

//     try {

//         const payload = req.body;
//         // console.log(payload);

//         const user = await userService.registerUserIntoDB(payload)
//         res.status(httpstatus.CREATED).json({

//             success: true,
//             statusCode: httpstatus.CREATED,
//             message: "User registered Successfully",
//             data: {
//                 user
//             }
//         })

//     } catch (error) {
//         console.log(error);
//         res.status(httpstatus.INTERNAL_SERVER_ERROR).json({
//             success: false,
//             statuscode: httpstatus.INTERNAL_SERVER_ERROR,
//             message: "Failed to register user",
//             error: (error as Error).message
//         })
//     }
// }
const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await userService.registerUserIntoDB(payload)
    // res.status(httpstatus.CREATED).json({

    //     success: true,
    //     statusCode: httpstatus.CREATED,
    //     message: "User registered Successfully",
    //     data: {
    //         user
    //     }
    // })

    sendResponse(res,{
        success:true,
        statusCode: httpstatus.CREATED,
        message: "User registered successfully",
        data: {user}
    })
});

const getMyprofile = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{

    // const {accessToken} = req.cookies;

    // console.log(req.user, "user request");

    // const verifidToken = jwtutils.verifyToken(accessToken,config.jwt_access_secret)

    // if (typeof verifidToken ==="string"){
    //     throw new Error(verifidToken)
    // }

    const profile = await userService.getMyprofileFromDB(req.user?.id as string)
   
    sendResponse(res,{
        success: true,
        statusCode: httpstatus.OK,
        message: "User profile fetched successfully",
        data: {profile}
    })

})


const updateMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
    const userId = req.user?.id as string;
    const payload = req.body;

    const updatedProfile = await userService.updateMyProfileIntoDB(userId,payload);
    sendResponse(res,{
        success: true,
        statusCode: httpstatus.OK,
        message: "User Profile Updated successfully",
        data: {updatedProfile}
    })
})

export const userController = {
    registerUser,
    getMyprofile,
    updateMyProfile
}