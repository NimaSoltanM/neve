import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { categories } from '@/features/marketplace/categories/schema'
import { shops } from '@/features/marketplace/shops/schema'
import { products } from '@/features/marketplace/products/schema'
import { bids } from '@/features/marketplace/bids/schema'
import { users } from '@/server/db/schema'

const db = drizzle(process.env.DATABASE_URL!)

async function main() {
  console.log('🌱 Starting seed...')

  // Step 1: Create test users
  console.log('Creating users...')
  const testUsers: (typeof users.$inferInsert)[] = [
    {
      id: 'user-1',
      phoneNumber: '+989121234567',
      firstName: 'Ali',
      lastName: 'Rezaei',
      isPhoneVerified: true,
    },
    {
      id: 'user-2',
      phoneNumber: '+989121234568',
      firstName: 'Sara',
      lastName: 'Ahmadi',
      isPhoneVerified: true,
    },
    {
      id: 'user-3',
      phoneNumber: '+989121234569',
      firstName: 'Mehdi',
      lastName: 'Karimi',
      isPhoneVerified: true,
    },
  ]

  await db.insert(users).values(testUsers)
  console.log(`✅ Created ${testUsers.length} users`)

  // Step 2: Create categories
  console.log('Creating categories...')

  // Root categories
  const rootCategories: (typeof categories.$inferInsert)[] = [
    {
      slug: 'electronics',
      name: { en: 'Electronics', fa: 'الکترونیک' },
      icon: 'Zap',
      isActive: true,
    },
    {
      slug: 'clothing',
      name: { en: 'Clothing', fa: 'پوشاک' },
      icon: 'Shirt',
      isActive: true,
    },
    {
      slug: 'home-garden',
      name: { en: 'Home & Garden', fa: 'خانه و باغ' },
      icon: 'Home',
      isActive: true,
    },
  ]

  const insertedRoots = await db
    .insert(categories)
    .values(rootCategories)
    .returning()

  // Child categories
  const childCategories: (typeof categories.$inferInsert)[] = [
    // Electronics children
    {
      parentId: insertedRoots[0].id,
      slug: 'phones',
      name: { en: 'Phones', fa: 'گوشی موبایل' },
      icon: 'Smartphone',
      isActive: true,
    },
    {
      parentId: insertedRoots[0].id,
      slug: 'laptops',
      name: { en: 'Laptops', fa: 'لپ‌تاپ' },
      icon: 'Laptop',
      isActive: true,
    },
    {
      parentId: insertedRoots[0].id,
      slug: 'cameras',
      name: { en: 'Cameras', fa: 'دوربین' },
      icon: 'Camera',
      isActive: true,
    },
    // Clothing children
    {
      parentId: insertedRoots[1].id,
      slug: 'mens-clothing',
      name: { en: "Men's Clothing", fa: 'پوشاک مردانه' },
      icon: 'User',
      isActive: true,
    },
    {
      parentId: insertedRoots[1].id,
      slug: 'womens-clothing',
      name: { en: "Women's Clothing", fa: 'پوشاک زنانه' },
      icon: 'User',
      isActive: true,
    },
    // Home children
    {
      parentId: insertedRoots[2].id,
      slug: 'furniture',
      name: { en: 'Furniture', fa: 'مبلمان' },
      icon: 'Sofa',
      isActive: true,
    },
  ]

  const insertedChildren = await db
    .insert(categories)
    .values(childCategories)
    .returning()
  console.log(
    `✅ Created ${insertedRoots.length + insertedChildren.length} categories`,
  )

  // Step 3: Create shops
  console.log('Creating shops...')
  const testShops: (typeof shops.$inferInsert)[] = [
    {
      userId: 'user-1',
      slug: 'tech-store',
      name: 'Tech Store',
      description: {
        en: 'Your one-stop shop for all electronics',
        fa: 'فروشگاه تخصصی الکترونیک',
      },
      isActive: true,
      isVerified: true,
    },
    {
      userId: 'user-2',
      slug: 'fashion-hub',
      name: 'Fashion Hub',
      description: {
        en: 'Trendy clothing and accessories',
        fa: 'پوشاک و اکسسوری مد روز',
      },
      isActive: true,
      isVerified: true,
    },
    {
      userId: 'user-3',
      slug: 'vintage-finds',
      name: 'Vintage Finds',
      description: {
        en: 'Rare and collectible items',
        fa: 'اقلام کمیاب و کلکسیونی',
      },
      isActive: true,
      isVerified: false,
    },
  ]

  const insertedShops = await db.insert(shops).values(testShops).returning()
  console.log(`✅ Created ${insertedShops.length} shops`)

  // Step 4: Create products
  console.log('Creating products...')

  // Get category IDs for reference
  const phonesCategory = insertedChildren.find((c) => c.slug === 'phones')!
  const laptopsCategory = insertedChildren.find((c) => c.slug === 'laptops')!
  const camerasCategory = insertedChildren.find((c) => c.slug === 'cameras')!
  const mensClothingCategory = insertedChildren.find(
    (c) => c.slug === 'mens-clothing',
  )!

  const testProducts: (typeof products.$inferInsert)[] = [
    // Regular products
    {
      shopId: insertedShops[0].id,
      categoryId: phonesCategory.id,
      slug: 'iphone-15-pro',
      name: 'iPhone 15 Pro',
      description: 'Latest Apple smartphone with titanium design',
      type: 'regular',
      price: '999.00',
      stock: 15,
      images: ['/static/iphone15.jpg'],
      isActive: true,
    },
    {
      shopId: insertedShops[0].id,
      categoryId: laptopsCategory.id,
      slug: 'macbook-pro-m3',
      name: 'MacBook Pro M3',
      description: '14-inch laptop with M3 chip',
      type: 'regular',
      price: '1999.00',
      stock: 8,
      images: ['/static/m3.jpg'],
      isActive: true,
    },
    {
      shopId: insertedShops[1].id,
      categoryId: mensClothingCategory.id,
      slug: 'premium-cotton-shirt',
      name: 'Premium Cotton Shirt',
      description: '100% organic cotton shirt',
      type: 'regular',
      price: '49.99',
      stock: 50,
      images: ['/static/shirts.jpg'],
      isActive: true,
    },
    // Auction products
    {
      shopId: insertedShops[2].id,
      categoryId: camerasCategory.id,
      slug: 'vintage-leica-m3',
      name: 'Vintage Leica M3 1954',
      description: 'Rare first-year production Leica M3 in excellent condition',
      type: 'auction',
      auctionStatus: 'active',
      startingPrice: '1500.00',
      currentBid: '1500.00',
      buyNowPrice: '3000.00',
      bidIncrement: '50.00',
      auctionEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      images: ['/static/camera1.jpg'],
      isActive: true,
    },
    {
      shopId: insertedShops[0].id,
      categoryId: phonesCategory.id,
      slug: 'sealed-iphone-2g',
      name: 'Sealed Original iPhone 2G',
      description: 'Factory sealed first generation iPhone from 2007',
      type: 'auction',
      auctionStatus: 'active',
      startingPrice: '5000.00',
      currentBid: '5500.00',
      buyNowPrice: '15000.00',
      bidIncrement: '100.00',
      auctionEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      images: ['/static/iphone2g.jpg'],
      isActive: true,
    },
    {
      shopId: insertedShops[2].id,
      categoryId: laptopsCategory.id,
      slug: 'apple-lisa-1983',
      name: 'Apple Lisa Computer 1983',
      description: 'Working Apple Lisa computer, piece of computing history',
      type: 'auction',
      auctionStatus: 'active',
      startingPrice: '2000.00',
      currentBid: '2000.00',
      bidIncrement: '100.00',
      auctionEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      images: ['/static/lisa.jpg'],
      isActive: true,
    },
  ]

  const insertedProducts = await db
    .insert(products)
    .values(testProducts)
    .returning()
  console.log(`✅ Created ${insertedProducts.length} products`)

  // Step 5: Create sample bids for auction products
  console.log('Creating sample bids...')

  const auctionProducts = insertedProducts.filter((p) => p.type === 'auction')

  const testBids: (typeof bids.$inferInsert)[] = [
    {
      productId: auctionProducts[1].id, // Sealed iPhone
      userId: 'user-2',
      amount: '5200.00',
      isWinning: false,
    },
    {
      productId: auctionProducts[1].id,
      userId: 'user-3',
      amount: '5500.00',
      isWinning: true,
    },
  ]

  await db.insert(bids).values(testBids)
  console.log(`✅ Created ${testBids.length} sample bids`)

  // Final stats
  console.log('\n📊 Seed Summary:')
  console.log(`   Users: ${testUsers.length}`)
  console.log(
    `   Categories: ${insertedRoots.length + insertedChildren.length}`,
  )
  console.log(`   Shops: ${insertedShops.length}`)
  console.log(`   Products: ${insertedProducts.length}`)
  console.log(
    `   - Regular: ${insertedProducts.filter((p) => p.type === 'regular').length}`,
  )
  console.log(
    `   - Auctions: ${insertedProducts.filter((p) => p.type === 'auction').length}`,
  )
  console.log(`   Bids: ${testBids.length}`)

  console.log('\n🎉 Seeding completed successfully!')
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
