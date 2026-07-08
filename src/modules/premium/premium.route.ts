import { NextFunction, Request, Response, Router } from "express";
import { premiumController } from "./premium.controller";
import { auth } from "../../middlewares/auth";
import { Role, SubscriptionStatus } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { prisma } from "../../lib/prisma";
import { subscriptionGuard } from "../../middlewares/premiumGurard";

const router = Router()

router.get("/",
    auth(Role.ADMIN,Role.AUTHOR,Role.USER),
    subscriptionGuard(),
    premiumController.getPremiumContent
)

export const premiumRoutes = router;