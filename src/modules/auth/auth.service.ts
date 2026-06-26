import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUser } from "./auth.interface"
import jwt, { SignOptions } from "jsonwebtoken"
import config from "../../config";
import { jwtutils } from "../../utils/jwt";

const loginUser = async (payload: ILoginUser) => {
    const { email, password } = payload;

    const user = await prisma.user.findUniqueOrThrow({
        where: { email }
    })
    if (user.activeStatus === "BLOCKD") {
        throw new Error("Your account has been blocked. Please contact with support.")
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
        throw new Error("Password is Incorrect");
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    }

    // const accessToken = jwt.sign(
    //     jwtPayload,
    //     config.jwt_access_secret,
    // {
    //     expiresIn: config.jwt_access_expires_in
    // } as SignOptions
    // );

    const accessToken = jwtutils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );


    // const refreshToken = jwt.sign(
    //     jwtPayload,
    //     config.jwt_refresh_secret,
    // {
    //     expiresIn: config.jwt_refresh_expires_in
    // } as SignOptions
    // );

    const refreshToken = jwtutils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        accessToken,
        refreshToken
    };
}

export const authService = {
    loginUser
}