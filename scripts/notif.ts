import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { notifications } from '@/features/notifications/schemas/notification.schema'

const db = drizzle(process.env.DATABASE_URL!)

async function seedNotifications() {
  const userId = 'ac0e5ff7-a0c0-4f43-8900-1df16749ff59'

  const sampleNotifications = [
    {
      userId,
      type: 'bid.outbid',
      title: "You've been outbid!",
      message:
        'Someone placed a higher bid on "Vintage Camera". Current bid is $250',
      priority: 'high',
      actionUrl: '/products/vintage-camera',
      metadata: { productId: 1, currentBid: 250, previousBid: 200 },
      isRead: false,
    },
    {
      userId,
      type: 'order.shipped',
      title: 'Order shipped!',
      message: 'Your order #12345 has been shipped and will arrive in 2-3 days',
      priority: 'normal',
      actionUrl: '/dashboard/orders/12345',
      metadata: { orderId: 12345, trackingNumber: 'TR123456789' },
      isRead: false,
    },
    {
      userId,
      type: 'bid.won',
      title: 'Congratulations! You won the auction',
      message: 'You won the auction for "MacBook Pro 2021" at $1,500',
      priority: 'urgent',
      actionUrl: '/dashboard/orders',
      metadata: { productId: 2, winningBid: 1500 },
      isRead: true,
      readAt: new Date(),
    },
    {
      userId,
      type: 'auction.ending',
      title: 'Auction ending soon!',
      message: 'The auction for "iPhone 15 Pro" ends in 1 hour',
      priority: 'high',
      actionUrl: '/products/iphone-15-pro',
      metadata: { productId: 3, endsAt: new Date(Date.now() + 3600000) },
      isRead: false,
      expiresAt: new Date(Date.now() + 3600000), // Expires when auction ends
    },
    {
      userId,
      type: 'system',
      title: 'Welcome to our marketplace!',
      message:
        'Thanks for joining. Start exploring amazing deals and auctions today.',
      priority: 'normal',
      actionUrl: '/marketplace',
      isRead: false,
    },
  ]

  try {
    const inserted = await db
      .insert(notifications)
      .values(sampleNotifications)
      .returning()
    console.log(
      `✅ Created ${inserted.length} notifications for user ${userId}`,
    )

    // Show what was created
    inserted.forEach((notif, index) => {
      console.log(
        `  ${index + 1}. ${notif.title} (${notif.type}) - ${notif.isRead ? 'Read' : 'Unread'}`,
      )
    })
  } catch (error) {
    console.error('❌ Error seeding notifications:', error)
  }
}

seedNotifications()
