export type PreviewState = {
  isOpen: boolean
  explored: string[]
}

export type PreviewFeature = {
  id: string
  icon: string
  titleKey: string
  descKey: string
  action: {
    type: 'navigate' | 'toggle-lang'
    to?: string
  }
  tech?: string[]
  badge?: 'new' | 'try-this'
}

export const PREVIEW_FEATURES: PreviewFeature[] = [
  {
    id: 'buy-something',
    icon: '🛍️',
    titleKey: 'preview.buy.title',
    descKey: 'preview.buy.desc',
    action: {
      type: 'navigate',
      to: '/marketplace',
    },
    badge: 'try-this',
  },
  {
    id: 'create-shop',
    icon: '🏪',
    titleKey: 'preview.vendor.title',
    descKey: 'preview.vendor.desc',
    action: {
      type: 'navigate',
      to: 'shop',
    },
    tech: ['Server Functions', 'Drizzle'],
  },
  {
    id: 'join-auction',
    icon: '🔨',
    titleKey: 'preview.auction.title',
    descKey: 'preview.auction.desc',
    action: {
      type: 'navigate',
      to: '/marketplace?page=1&type=auction',
    },
    tech: ['Real-time'],
  },
  {
    id: 'rtl-support',
    icon: '🌍',
    titleKey: 'preview.rtl.title',
    descKey: 'preview.rtl.desc',
    action: {
      type: 'toggle-lang',
    },
  },
]
