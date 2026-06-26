import { NextFunction, Request, Response, Router } from "express";

import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import config from "../../config";
import httpstatus from "http-status"
import { userController } from "./user.controller";
import { jwtutils } from "../../utils/jwt";
import { Role } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { auth } from "../../middlewares/auth";

const router = Router();



router.post("/register", userController.registerUser)
//auth(Role.ADMIN, Role.USER,Role.AUTHOR)
//auth()=> ... requieredRoles =>[Role.ADMIN, Role.USER,Role.AUTHOR]

router.get("/me", auth(Role.ADMIN, Role.USER, Role.AUTHOR) , userController.getMyprofile)


// router.get("/me", 
//     (req: Request, res: Response, next: NextFunction) => {
//     console.log(req.cookies);
//     const { accessToken } = req.cookies;

//     console.log(accessToken);

//     const verifidToken = jwtutils.verifyToken(accessToken, config.jwt_access_secret)

//     if (!verifidToken.success) {
//         throw new Error(verifidToken.error)
//     }

//     const { email, name, id, role } = verifidToken.data as JwtPayload;
//     // const requieredRoles = ["ADMIN","USER","AUTHOR"]

//     const requieredRoles = [Role.ADMIN, Role.AUTHOR, Role.USER]

//     if (!requieredRoles.includes(role)) {
//         return res.status(403).json({
//             success: false,
//             statuscode: httpstatus.FORBIDDEN,
//             message: "You do not have permission to access this resource.",
//         })
//     }

//     req.user = {
//         email,
//         name,
//         id,
//         role
//     }
//     next();
// }, 
// userController.getMyprofile)

// updat profile
router.put("/my-profile", auth(Role.ADMIN,Role.USER), userController.updateMyProfile)

export const userRoutes = router;