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

    // handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            
           
        
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
export const subscriptionServices = {
    createCheckoutSession,
    handleWebhook
}