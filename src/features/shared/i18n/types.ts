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
    goHome: string
    copy: string
    characters: string
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
    invalidOtp: string
    tooManyAttempts: string
    tooManyOtpRequests: string
    otpStillValid: string
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

    alreadyHaveShop: string
    noDescription: string
    manageShop: string

    // Form headers
    startBusiness: string
    createShopDesc: string
    basicInfo: string
    basicInfoDesc: string
    updateInfoDesc: string
    description: string
    descriptionHelper: string
    branding: string
    brandingHelper: string

    // Fields
    shopName: string
    shopNamePlaceholder: string
    shopNameHelper: string
    shopUrl: string
    shopUrlPlaceholder: string
    shopUrlHelper: string
    urlPrefix: string
    manualRequired: string
    persianDetected: string

    logo: string
    logoPlaceholder: string
    logoHelper: string
    banner: string
    bannerPlaceholder: string
    bannerHelper: string

    // Alerts
    beforeContinue: string
    urlNoChange: string
    addLaterInfo: string
    oneShopPerUser: string

    updateShop: string
    creating: string
    updating: string
    created: string
    updated: string

    shopStatus: string

    shopActiveDesc: string
    shopInactiveDesc: string
    whatsNext: string
    readyToLaunch: string
    activeShopInfo: string
    inactiveShopInfo: string
    activateShop: string
    deactivateShop: string
    activating: string
    deactivating: string
    confirmActivation: string
    confirmDeactivation: string
    activationDialogDesc: string
    deactivationDialogDesc: string
    activationNote: string
    deactivationNote: string
    activationPoint1: string
    activationPoint2: string
    activationPoint3: string
    deactivationPoint1: string
    deactivationPoint2: string
    deactivationPoint3: string
    yesActivate: string
    yesDeactivate: string
    activationSuccess: string
    deactivationSuccess: string
    settingsUpdated: string
    brandingDesc: string
    saveChanges: string
    saving: string
    settings: string
    settingsDesc: string

    allProducts: string
    productsSubtitle: string
    addNewProduct: string
    editProduct: string
    deleteProduct: string
    productDeleted: string
    productUpdated: string
    confirmDelete: string
    confirmDeleteDesc: string
    noProductsDesc: string
    regularProduct: string
    auctionProduct: string
    type: string
    category: string
    viewProduct: string

    shopInactiveAlertDesc: string
    goToSettings: string
    showingResults: string
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

    under: string
    above: string

    clearFilters: string
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

    productType: string
    selectProductType: string
    regularDesc: string
    auctionDesc: string
    basicInformation: string
    basicInformationDesc: string
    persianNameWarning: string
    slug: string
    slugDesc: string
    imagesDesc: string
    pricingInventory: string
    pricingInventoryDesc: string
    stockDesc: string
    auctionPricing: string
    auctionPricingDesc: string
    bidIncrementDesc: string
    auctionEndDateDesc: string
    pickDate: string

    productTypeDesc: string
    productNameDesc: string
    slugPlaceholder: string
    manualSlug: string
    descriptionPlaceholder: string
    descriptionDesc: string
    shop: string
    shopDesc: string
    category: string
    categoryDesc: string
    images: string
    price: string
    auctionNotice: string
    auctionNoticeDesc: string
    auctionDetails: string
    auctionDetailsDesc: string
    regularProductDesc: string
    auctionProductDesc: string
    basicInfo: string
    editProductDesc: string
    addProductDesc: string
    reset: string
    create: string
    update: string
    saving: string
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
    login: string
    home: string
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
  bids: {
    title: string
    tabs: {
      active: string
      won: string
      lost: string
    }
    stats: {
      activeBids: string
      currentlyBidding: string
      wonAuctions: string
      totalWins: string
      totalBids: string
      last30Days: string
      totalSpent: string
      paidAuctions: string
    }
    empty: {
      active: string
      won: string
      lost: string
    }
    yourBid: string
    currentBid: string
    status: {
      winning: string
      outbid: string
    }
    bidAgain: string
    browseAuctions: string
    wonFor: string
    remaining: string
    checkout: string
    inCart: string
    pendingPayment: string
    overduePayment: string
    overdueDescription: string
    soldFor: string
    wonBy: string
    viewSimilar: string
  }
  notFoundErrors: {
    notFound: string
    notFoundDescription: string
    shopNotFound: string
    shopNotFoundDesc: string
    shopMightBe: string
    shopInactive: string
    shopDeleted: string
    shopUrlChanged: string
    goBack: string
    browseShops: string
    searchShops: string
  }
  dashboard: {
    overview: {
      welcome: string
      quickStats: string
      totalOrders: string
      activeBids: string
      pendingPayments: string
      recentOrders: string
      recentOrdersEmpty: string
      activeBidsSection: string
      activeBidsEmpty: string
      endingSoon: string
      quickActions: string
      browseMarketplace: string
      viewAllOrders: string
      checkBids: string
      viewAll: string
    }
  }
  shopOverview: {
    welcome: string
    todaySales: string
    thisWeek: string
    thisMonth: string
    totalRevenue: string
    totalProducts: string
    activeAuctions: string
    pendingOrders: string
    recentOrders: string
    recentOrdersEmpty: string
    topProducts: string
    topProductsEmpty: string
    lowStockAlerts: string
    lowStockEmpty: string
    quickActions: string
    addProduct: string
    manageAuctions: string
    viewAnalytics: string
    salesCount: string
    stockCount: string
    outOfStock: string
    items: string
    viewAll: string
    edit: string
    orderStatus: {
      pending: string
      paid: string
      completed: string
      cancelled: string
    }
  }
  shopOrders: {
    manageDescription: string
    allOrders: string
    orderId: string
    customer: string
    items: string
    item: string
    itemsPlural: string
    total: string
    status: string
    date: string
    actions: string
    noOrders: string
    noOrdersYet: string
    noOrdersWithFilter: string
    pending: string
    paid: string
    completed: string
    cancelled: string
    pageInfo: string
    updateSuccess: string
    updateError: string
  }
  analytics: {
    title: string
    overview: string
    revenue: string
    orders: string
    totalRevenue: string
    totalOrders: string
    averageOrderValue: string
    conversionRate: string
    vsPreviousPeriod: string
    revenueOverTime: string
    topProducts: string
    product: string
    unitsSold: string
    noProducts: string
    noData: string
    period7d: string
    period30d: string
    period90d: string
    period1y: string
    customRange: string
    demoMode: string
    realMode: string
    viewRawData: string
    demoDataNotice: string
    selectPeriod: string
    demoModeTitle: string
    realModeTitle: string
    demoModeDescription: string
    realModeDescription: string
    demoModeFeature1: string
    demoModeFeature2: string
    demoModeFeature3: string
    howItWorks: string
    demoExplainer: string
    realExplainer: string
  }
  preview: {
    title: string
    subtitle: string
    dismiss: string
    tryIt: string
    explored: string
    buy: {
      title: string
      desc: string
    }
    vendor: {
      title: string
      desc: string
    }
    auction: {
      title: string
      desc: string
    }
    rtl: {
      title: string
      desc: string
    }
  }
  profile: {
    title: string
    editProfile: string
    personalInfo: string
    accountInfo: string
    firstName: string
    lastName: string
    phoneNumber: string
    memberSince: string
    uploadAvatar: string
    removeAvatar: string
    saveChanges: string
    saving: string
    updateSuccess: string
    updateError: string
  }
}

export type TranslationParams = Record<string, string | number>
