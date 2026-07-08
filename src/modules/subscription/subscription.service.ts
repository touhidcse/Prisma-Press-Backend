import Stripe from "stripe"
import { prisma } from "../../lib/prisma"
import stripe from "../../lib/stripe"
import config from "../../config"


const createCheckoutSession = async (userId: string) => {

    const transactionResult = await prisma.$transaction(async (tx) => {

        const user = await tx.user.findFirstOrThrow({
            where: {
                id: userId
            },
            include: {
                subscription: true
            }
        })

        // old subscriber

        let stripeCustomerId = user.subscription?.stripeCustomerId

        if (!stripeCustomerId) {

            //new subscriber
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user.id }
            })

            stripeCustomerId = customer.id;
        }

        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price: config.stripe_product_price_id,
                quantity: 1
            }],
            mode: "subscription",
            customer: stripeCustomerId,
            payment_method_types: ["card"],
            success_url: `${config.app_url}/premium?success=true`,
            cancel_url: `${config.app_url}/payment?success=false`,
            metadata: { userId: user.id }
        })

        return session.url;

    });

    return {
        paymentURL: transactionResult
    }
}


const handleWebhook = async (payload: Buffer, signature: string) => {

    const endpointSecret = config.stripe_webhook_secret;
    const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
    )

    // console.log("Event Type:", event.type);
    // console.log(event.data.object);
    // handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            // console.log(event.data.object);
            await handleCheckoutCompleted(event.data.object)


            break;
        case 'customer.subscription.updated':


            break;
        case 'customer.subscription.deleted':

            break;
        default:
            // Unexpected event type
            console.log(`No event matched. Unhandled event type ${event.type}.`);
            break;
    }
}



const getPeriodEnd = (payload: Stripe.Subscription)=>{
    // console.log("Sub infro", stripeSubscripton.items.data[0]);

    // const currentPeriodStart = stripeSubscripton.items.data[0]?.current_period_start;
    const currentPeriodEndInMilliSecond = payload.items.data[0]?.current_period_end!;
    const currentPeriodEnd = new Date(currentPeriodEndInMilliSecond * 1000)
    // console.log("currentEnd", currentPeriodEnd);

    return currentPeriodEnd;
}


const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
    const userId = session.metadata?.userId;
    const stripeCustomerId = session.customer as string;
    const stripeSubscriptionId = session.subscription as string;

    if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
        throw new Error("Webhook Failed")
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

export const subscriptionServices = {
    createCheckoutSession,
    handleWebhook
}