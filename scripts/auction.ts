import 'dotenv/config'
import { products } from '@/features/marketplace/products/schema'
import { shops } from '@/features/marketplace/shops/schema'
import { categories } from '@/features/marketplace/categories/schema'
import { eq } from 'drizzle-orm'
import db from '@/server/db'

async function seedAuctions() {
  console.log('🏷️ Creating test auctions with short timers...')

  try {
    // Get existing shop and category IDs
    const techShop = await db.query.shops.findFirst({
      where: eq(shops.slug, 'tech-store'),
    })

    const vintageShop = await db.query.shops.findFirst({
      where: eq(shops.slug, 'vintage-finds'),
    })

    const camerasCategory = await db.query.categories.findFirst({
      where: eq(categories.slug, 'cameras'),
    })

    const phonesCategory = await db.query.categories.findFirst({
      where: eq(categories.slug, 'phones'),
    })

    if (!techShop || !vintageShop || !camerasCategory || !phonesCategory) {
      console.error(
        'Required shops or categories not found. Run main seed first.',
      )
      return
    }

    const now = new Date()

    const auctionProducts: (typeof products.$inferInsert)[] = [
      {
        shopId: vintageShop.id,
        categoryId: camerasCategory.id,
        slug: 'canon-ae1-program',
        name: 'Canon AE-1 Program 1981',
        description:
          'Classic 35mm film camera in working condition with 50mm f/1.8 lens',
        type: 'auction',
        startingPrice: '150.00',
        currentBid: '150.00',
        buyNowPrice: '400.00',
        bidIncrement: '10.00',
        auctionEndsAt: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes from now
        images: [
          'https://images.unsplash.com/photo-1614008375890-cb53b1ddaa59?w=800',
        ],
        isActive: true,
      },
      {
        shopId: techShop.id,
        categoryId: phonesCategory.id,
        slug: 'samsung-galaxy-s23-ultra',
        name: 'Samsung Galaxy S23 Ultra - Mint Condition',
        description:
          '256GB, Phantom Black, comes with original box and accessories',
        type: 'auction',
        startingPrice: '600.00',
        currentBid: '600.00',
        buyNowPrice: '900.00',
        bidIncrement: '25.00',
        auctionEndsAt: new Date(now.getTime() + 2 * 60 * 1000), // 10 minutes from now
        images: [
          'https://images.unsplash.com/photo-1674763301530-f73a9351d9fc?w=800',
        ],
        isActive: true,
      },
    ]

    const inserted = await db
      .insert(products)
      .values(auctionProducts)
      .returning()

    console.log('✅ Created test auctions:')
    inserted.forEach((product) => {
      const minutesLeft = product.auctionEndsAt
        ? Math.round((product.auctionEndsAt.getTime() - now.getTime()) / 60000)
        : 0
      console.log(`   - ${product.name}: ends in ${minutesLeft} minutes`)
    })

    console.log('\n🎯 Ready for bid testing!')
    console.log(
      'You can now place bids on these products to test notifications',
    )
  } catch (error) {
    console.error('❌ Failed to create test auctions:', error)
    process.exit(1)
  }
}

seedAuctions()
  .then(() => {
    console.log('✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
