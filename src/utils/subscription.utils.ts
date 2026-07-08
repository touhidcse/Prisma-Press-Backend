import Stripe from "stripe";
import { prisma } from "../lib/prisma";
import stripe from "../lib/stripe";
import { SubscriptionStatus } from "../../generated/prisma/enums";

export const getPeriodEnd = (payload: Stripe.Subscription) => {
    // console.log("Sub infro", stripeSubscripton.items.data[0]);

    // const currentPeriodStart = stripeSubscripton.items.data[0]?.current_period_start;
    const currentPeriodEndInMilliSecond = payload.items.data[0]?.current_period_end!;
    const currentPeriodEnd = new Date(currentPeriodEndInMilliSecond * 1000)
    // console.log("currentEnd", currentPeriodEnd);

    return currentPeriodEnd;
}


export const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
    
    const userId = session.metadata?.userId as string;
    const stripeCustomerId = session.customer as string;
    const stripeSubscriptionId = session.subscription as string;

    console.log("Checkout completed webhook fired from subscription.utils");

    console.log(session);

    console.log({
        userId,
        stripeCustomerId,
        stripeSubscriptionId,
    });
    
    if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
        console.log("Webhook: Missing value for creating checkout session ");
        return;
    }

    const stripeSubscripton = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const currentPeriodEnd = getPeriodEnd(stripeSubscripton)
    await prisma.subscription.upsert({
        where: {
            userId
        },
        create: {
            userId,
            stripeCustomerId,
            stripeSubscriptionId,
            status: "ACTIVE",
            currentPeriodEnd
        },
        update: {
            stripeCustomerId,
            stripeSubscriptionId,
            status: "ACTIVE",
            currentPeriodEnd
        }
    })
    
}

export const handleChangeSubscription = async (payload: Stripe.Subscription) => {
    const stripeSubscriptionId = payload.id;
    const status = (payload.status === "active" || payload.status === "trialing") ? SubscriptionStatus.ACTIVE :
        payload.status === "canceled" ? SubscriptionStatus.CANCEL :
            SubscriptionStatus.EXPIRED;
    const currentPeriodEnd = getPeriodEnd(payload)

    const isSubscriptionExist = await prisma.subscription.findUnique({
        where: {
            stripeSubscriptionId
        }
    })
    if (!isSubscriptionExist) {
        console.log(`Webhook: No subscripton found for subscription id : ${stripeSubscriptionId}`);
        return;
    }

    await prisma.subscription.update({
        where: {
            stripeSubscriptionId
        },
        data: {
            status,
            currentPeriodEnd
        }
    })
}