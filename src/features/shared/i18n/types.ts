export type Translations = {
  common: {
    submit: string
    cancel: string
    continue: string
    back: string
    error: string
    success: string
    loading: string
    save: string
    delete: string
    edit: string
    add: string
    search: string
    clear: string
    close: string
    confirm: string
    yes: string
    no: string
    all: string
    none: string
    select: string
    selected: string
    required: string
    optional: string
    category: string
    categories: string
    subcategory: string
    subcategories: string
    viewAll: string
    noResults: string
    name: string
    description: string
    price: string
    quantity: string
    stock: string
    images: string
    image: string
    status: string
    actions: string
    createdAt: string
    updatedAt: string
    siteName: string
    siteTagline: string
  }
  auth: {
    phoneNumber: string
    phoneNumberPlaceholder: string
    sendCode: string
    verifyCode: string
    otpCode: string
    otpCodePlaceholder: string
    resendCode: string
    resendIn: string
    firstName: string
    firstNamePlaceholder: string
    lastName: string
    lastNamePlaceholder: string
    completeProfile: string
    profileTitle: string
    profileSubtitle: string
    welcomeBack: string
    signInTitle: string
    signInSubtitle: string
    verifyTitle: string
    verifySubtitle: string
    invalidPhoneNumber: string
    invalidCode: string
    codeSent: string
    logout: string
  }
  dashboard: {
    profileInfo: string
    name: string
    phoneNumber: string
    memberSince: string
  }
  categories: {
    title: string
    subtitle: string
    allCategories: string
    popularCategories: string
    browseBy: string
    itemsInCategory: string
    noItemsFound: string
    backToCategories: string
    subcategoriesOf: string
  }
  shops: {
    startYourBusiness: string
    createShopToday: string
    createShop: string
    createShopDescription: string
    creatingShop: string
    shopCreatedSuccessfully: string
    basicInformation: string
    contactInformation: string
    nameEn: string
    nameEnPlaceholder: string
    nameFa: string
    nameFaPlaceholder: string
    descriptionEn: string
    descriptionEnPlaceholder: string
    descriptionFa: string
    descriptionFaPlaceholder: string
    email: string
    emailPlaceholder: string
    phone: string
    phonePlaceholder: string
    city: string
    cityPlaceholder: string
    address: string
    addressPlaceholder: string
    active: string
    inactive: string
    verified: string
    allShops: string
    discoverGreatShops: string
    searchShops: string
    filterByCity: string
    noShopsFound: string
    noShopsYet: string
    tryDifferentSearch: string
    noShopsFoundDescription: string
    createFirstShop: string
    showingResults: string
    products: string
    rating: string
    totalSales: string
    totalProducts: string
    memberSince: string
    contactSeller: string
    followShop: string
    viewShop: string
    manage: string
    policies: string
    shipping: string
    returns: string
    businessHours: string
    shopStats: string
    noProducts: string
    noProductsDescription: string
    myShops: string
    manageYourShops: string
    createAnotherShop: string
    expandYourBusiness: string
    startYourBusinessToday: string
    totalShops: string
    acrossAllShops: string
    allTimeTotal: string
    avgRating: string
    outOfFive: string
    daysActive: string
    shopInactiveWarning: string
    shopNotVerifiedWarning: string
  }
  upload: {
    dragOrClick: string
    fileTooLarge: string
    uploadFailed: string
    deleteFailed: string
    uploadImage: string
    uploadImages: string
    removeImage: string
    mainImage: string
  }
  marketplace: {
    title: string
    subtitle: string
    searchPlaceholder: string
    browseCategories: string
    featuredProducts: string
    searchResults: string
    categories: string
    allCategories: string
    products: string

    // Product related
    auction: string
    buyNow: string
    addToCart: string
    placeBid: string
    currentBid: string
    startingPrice: string
    inStock: string
    outOfStock: string
    noProductsFound: string
    noProductsInCategory: string
    shopNoProducts: string
    auctionEnded: string
    ended: string
    winning: string
    youAreWinning: string
    bids: string
    loginToBid: string
    loginToBuy: string
    youWereOutbid: string
    addedToCart: string

    // Filters
    filters: string
    productType: string
    allProducts: string
    auctions: string
    priceRange: string
    min: string
    max: string
    sortBy: string
    newest: string
    priceLowToHigh: string
    priceHighToLow: string
    endingSoon: string
    additionalFilters: string
    inStockOnly: string
    endingIn24h: string
    applyFilters: string

    // Shop
    verified: string
    memberSince: string

    // Bidding
    minimumBid: string
    quickBid: string
    yourBid: string
    confirmBid: string
    bidPlaced: string
    bidFailed: string
    bidTooLow: string
    buyNowAvailable: string

    noCategoriesFound: string
  }
  products: {
    // Product management
    addProduct: string
    editProduct: string
    deleteProduct: string
    productDetails: string
    productInformation: string
    pricingAndInventory: string
    auctionSettings: string

    // Form fields
    productName: string
    productNamePlaceholder: string
    productDescription: string
    productDescriptionPlaceholder: string
    selectCategory: string
    selectShop: string
    regularProduct: string
    auctionProduct: string

    // Pricing
    regularPrice: string
    startingBid: string
    bidIncrement: string
    minimumIncrement: string
    buyNowPrice: string
    enableBuyNow: string

    // Auction
    auctionDuration: string
    auctionStartDate: string
    auctionEndDate: string
    days: string
    hours: string
    minutes: string

    // Status
    publish: string
    draft: string
    published: string
    unpublished: string
    active: string
    inactive: string

    // Validation
    nameRequired: string
    categoryRequired: string
    priceRequired: string
    stockRequired: string
    startingBidRequired: string
    incrementRequired: string
    durationRequired: string
    invalidPrice: string
    invalidStock: string

    // Success/Error messages
    productAdded: string
    productUpdated: string
    productDeleted: string
    productNotFound: string
    updateFailed: string
    deleteFailed: string
  }
  validation: {
    required: string
    invalid: string
    tooShort: string
    tooLong: string
    invalidFormat: string
    mustBeNumber: string
    mustBePositive: string
    minValue: string
    maxValue: string
    invalidEmail: string
    invalidPhone: string
    selectOption: string
    atLeastOne: string
  }
  nav: {
    main: string
    marketplace: string
    categories: string
    shops: string
    dashboard: string
    orders: string
    bids: string
    wishlist: string
    myShop: string
    overview: string
    profile: string
    settings: string
    account: string
    selling: string
    createShop: string
    backToDashboard: string
  }
  shop: {
    management: string
    overview: string
    products: string
    allProducts: string
    addProduct: string
    categories: string
    orders: string
    auctions: string
    insights: string
    analytics: string
    revenue: string
    configuration: string
    settings: string
    viewStorefront: string
  }
  cart: {
    title: string
    empty: string
    continueShopping: string
    total: string
    clear: string
    checkout: string
    yourBid: string
    lowStock: string
    addToCart: string
    adding: string
    added: string
    inCart: string
    addedToCart: string
  }
  orders: {
    checkout: string
    orderSummary: string
    items: string
    total: string
    subtotal: string
    shipping: string
    free: string
    shippingAddress: string
    fullName: string
    fullNamePlaceholder: string
    phoneNumber: string
    address: string
    addressPlaceholder: string
    city: string
    cityPlaceholder: string
    postalCode: string
    placeOrder: string
    placingOrder: string
    orderNumber: string
    soldBy: string
    auctionWin: string
    quantity: string
    payNow: string
    processing: string
    cancel: string
    confirmCancel: string
    paidAt: string
    myOrders: string
    noOrders: string
    startShopping: string
    viewDetails: string
    paymentSuccessful: string
    thankYouOrder: string
    paymentDate: string
    shippingTo: string
    whatNext: string
    confirmationEmail: string
    preparingOrder: string
    trackingInfo: string
    viewOrder: string
    continueShopping: string
  }
  landing: {
    // Hero Section
    badge: string
    title: string
    subtitle: string
    exploreButton: string
    sourceCodeButton: string
    contactButton: string

    // Stats
    stats: {
      features: string
      featuresCount: string
      fullStack: string
      fullStackValue: string
      techStack: string
      techStackValue: string
      design: string
      designValue: string
    }

    // Features Section
    featuresTitle: string
    featuresSubtitle: string

    // Feature Cards
    multiVendor: {
      title: string
      description: string
      point1: string
      point2: string
      point3: string
    }

    orderFlow: {
      title: string
      description: string
      point1: string
      point2: string
      point3: string
    }

    auction: {
      title: string
      description: string
      point1: string
      point2: string
      point3: string
    }

    // Technical Section
    technicalTitle: string
    technicalSubtitle: string

    // Tech Stack
    frontend: {
      title: string
      item1: string
      item2: string
      item3: string
      item4: string
    }

    backend: {
      title: string
      item1: string
      item2: string
      item3: string
      item4: string
    }

    keyFeatures: {
      title: string
      item1: string
      item2: string
      item3: string
      item4: string
    }

    // Why This Project
    whyProject: {
      title: string
      description: string
    }

    // CTA Section
    ctaTitle: string
    ctaSubtitle: string
    tryPlatformButton: string
    githubButton: string
  }

  notifications: {
    title: string
    empty: string
    emptyTitle: string
    emptyDescription: string
    viewAll: string
    markAllRead: string
    clearAll: string
    unreadCount: string
    all: string
    unread: string
    read: string
    noUnread: string
    noRead: string
    noNotifications: string
    bids: string
    orders: string
    system: string
    total: string
    delete: string
    priority: {
      urgent: string
      high: string
      normal: string
      low: string
    }
  }
}
