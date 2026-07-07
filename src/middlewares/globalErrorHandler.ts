import { NextFunction, Request, Response } from "express"
import httpstatus from "http-status"
import { Prisma } from "../../generated/prisma/client";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    console.log("Error : ", err);

    let statusCode;
    let errorMesage = err.message || "Internal server Error";
    let errornName = err.name || "Internal server Error"
    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = httpstatus.BAD_REQUEST
        errorMesage = "You have provider incorrect field of missing fields"
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            statusCode = httpstatus.BAD_REQUEST,
                errorMesage = "Duplicate Key Error"
        } else if (err.code === "P2003") {
            statusCode = httpstatus.BAD_REQUEST,
                errorMesage = "Foreign key constrain failed"
        } else if (err.code === "P2025") {
            statusCode = httpstatus.BAD_REQUEST
            errorMesage = "An operation failed because it depends on one or more records that were required but not found. {cause}"
        }
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        if (err.errorCode === "P1000") {
            statusCode = httpstatus.UNAUTHORIZED,
                errorMesage = "Authentication failed again DB server. Please check your Credentials"
        } else if (err.errorCode === "P1001") {
            statusCode = httpstatus.BAD_REQUEST
            errorMesage = "Can't reach database server"
        }
    } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = httpstatus.INTERNAL_SERVER_ERROR,
            errorMesage = "Error occur during execution"
    }

    res.status(httpstatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        statuscode: statusCode || httpstatus.INTERNAL_SERVER_ERROR,
        name: errornName,
        message: errorMesage,
        error: err.stack
    })
}