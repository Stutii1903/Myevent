import Stripe from 'stripe' // Capital S
import { NextResponse } from 'next/server'
import { createOrder } from '@/lib/actions/order.actions'

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2024-06-20', // Use API version 2024-06-20
})

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') as string
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ message: 'Webhook error', error: err }, { status: 400 })
  }

  const eventType = event.type
  console.log('Received webhook event:', eventType)

  if (eventType === 'checkout.session.completed') {
    const { id, amount_total, metadata } = event.data.object

    const order = {
      stripeId: id,
      eventId: metadata?.eventId || '',
      buyerId: metadata?.buyerId || '',
      totalAmount: amount_total ? (amount_total / 100).toString() : '0',
      createdAt: new Date(),
    }

    try {
      const newOrder = await createOrder(order)
      console.log('Order created successfully:', newOrder)
      return NextResponse.json({ message: 'OK', order: newOrder })
    } catch (error) {
      console.error('Failed to create order:', error)
      return NextResponse.json({ message: 'Order creation failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ message: 'Event received' }, { status: 200 })
}