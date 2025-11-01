import type { products, bids } from '@/server/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

// Base types from database schema
export type Product = InferSelectModel<typeof products>
export type Bid = InferSelectModel<typeof bids>

// Product with relations (as returned by queries with .with())
export type ProductType = Product & {
  bids?: Bid[]
  shop?: {
    id: number
    name: string
    slug: string
  }
  category?: {
    id: number
    name: { en: string; fa: string }
    slug: string
  }
}

// Bid type alias
export type BidType = Bid
