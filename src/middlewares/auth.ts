import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { jwtutils } from "../utils/jwt";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";

declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string;
                name: string;
                id: string;
                role: Role;
            }
        }
    }
}

export const auth = (...requieredRoles: Role[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies.accessToken ? 
            req.cookies.accessToken
            :
            req.headers.authorization?.startsWith("Bearer") ? req.headers.authorization?.split(" ")[1] : req.headers.authorization;

        if (!token) {
            throw new Error("You are not logged in. Please log in to access this resource.")
        }


        const verifidToken = jwtutils.verifyToken(token, config.jwt_access_secret)

        if (!verifidToken.success) {
            throw new Error(verifidToken.error)
        }

        const { email, name, id, role } = verifidToken.data as JwtPayload;

        if (requieredRoles.length && !requieredRoles.includes(role)) {
            throw new Error("Forbidden. You do not have permission to access this resource.")
        }
        // user exist kore kina

        const user = await prisma.user.findUnique({
            where: {
                id,
                email,
                name,
                role
            }
        });

        if (!user) {
            throw new Error("user not found. Please log in Again")
        }
        if (user.activeStatus === "BLOCKD") {
            throw new Error("Your account has been blocked. Please contact with support.")
        }

        req.user = {
            email,
            id,
            role,
            name
        }
        next();
    }
)};
