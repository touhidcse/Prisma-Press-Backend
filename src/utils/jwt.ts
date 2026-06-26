import jwt, { JwtPayload, SignOptions } from "jsonwebtoken"

const createToken = (payload: JwtPayload, secret: string, expiresIn: SignOptions) => {

    const token = jwt.sign(
        payload,
        secret,
        {
            expiresIn
        } as SignOptions
    )

    return token;
}

const verifyToken = (token: string, secret: string) => {
    try {
        const verifidToken = jwt.verify(token, secret);
        return {
            success: true,
            data: verifidToken
        }
    } catch (error : any) {
        console.log("token verification failed",error);
        return {
            success: false,
            error: error.message
        }
    }
}
export const jwtutils = {
    createToken,
    verifyToken
}