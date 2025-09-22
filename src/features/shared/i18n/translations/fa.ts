import { Translations } from '../types'

const fa: Translations = {
  common: {
    submit: 'ارسال',
    cancel: 'انصراف',
    continue: 'ادامه',
    back: 'بازگشت',
    error: 'خطا',
    success: 'موفق',
    loading: 'در حال بارگذاری...',
    category: 'دسته‌بندی',
    categories: 'دسته‌بندی‌ها',
    subcategory: 'زیردسته',
    subcategories: 'زیردسته‌ها',
    viewAll: 'مشاهده همه',
    noResults: 'نتیجه‌ای یافت نشد',
    save: 'ذخیره',
    delete: 'حذف',
    edit: 'ویرایش',
    add: 'افزودن',
    search: 'جستجو',
    clear: 'پاک کردن',
    close: 'بستن',
    confirm: 'تایید',
    yes: 'بله',
    no: 'خیر',
    all: 'همه',
    none: 'هیچکدام',
    select: 'انتخاب',
    selected: 'انتخاب شده',
    required: 'الزامی',
    optional: 'اختیاری',
    name: 'نام',
    description: 'توضیحات',
    price: 'قیمت',
    quantity: 'تعداد',
    stock: 'موجودی',
    images: 'تصاویر',
    image: 'تصویر',
    status: 'وضعیت',
    actions: 'عملیات',
    createdAt: 'تاریخ ایجاد',
    updatedAt: 'تاریخ بروزرسانی',
    siteName: 'بازار',
    siteTagline: 'خرید، فروش، مزایده',
  },
  auth: {
    phoneNumber: 'شماره موبایل',
    phoneNumberPlaceholder: '۰۹۱۲۳۴۵۶۷۸۹',
    sendCode: 'ارسال کد',
    verifyCode: 'تایید کد',
    otpCode: 'کد تایید',
    otpCodePlaceholder: '۱۲۳۴۵',
    resendCode: 'ارسال مجدد کد',
    resendIn: 'ارسال مجدد در',
    firstName: 'نام',
    firstNamePlaceholder: 'علی',
    lastName: 'نام خانوادگی',
    lastNamePlaceholder: 'احمدی',
    completeProfile: 'تکمیل پروفایل',
    profileTitle: 'تکمیل پروفایل',
    profileSubtitle: 'لطفا نام خود را وارد کنید',
    welcomeBack: 'خوش آمدید',
    signInTitle: 'ورود / ثبت نام',
    signInSubtitle: 'شماره موبایل خود را وارد کنید',
    verifyTitle: 'تایید شماره',
    verifySubtitle: 'کد ارسال شده به این شماره را وارد کنید',
    invalidPhoneNumber: 'فرمت شماره موبایل نادرست است',
    invalidCode: 'کد نامعتبر یا منقضی شده',
    codeSent: 'کد با موفقیت ارسال شد',
    logout: 'خروج',
  },
  dashboard: {
    profileInfo: 'اطلاعات پروفایل',
    name: 'نام',
    phoneNumber: 'شماره موبایل',
    memberSince: 'عضو از تاریخ',
  },
  categories: {
    title: 'مرور دسته‌بندی‌ها',
    subtitle: 'محصولات را بر اساس دسته‌بندی پیدا کنید',
    allCategories: 'همه دسته‌بندی‌ها',
    popularCategories: 'دسته‌بندی‌های محبوب',
    browseBy: 'مرور بر اساس دسته‌بندی',
    itemsInCategory: 'آیتم در این دسته‌بندی',
    noItemsFound: 'هیچ آیتمی در این دسته‌بندی یافت نشد',
    backToCategories: 'بازگشت به دسته‌بندی‌ها',
    subcategoriesOf: 'زیردسته‌های',
  },
  shops: {
    // Shop creation
    startYourBusiness: 'کسب و کار خود را شروع کنید',
    createShopToday: 'امروز فروشگاه خود را ایجاد کنید و شروع به فروش کنید',
    createShop: 'ایجاد فروشگاه',
    createShopDescription: 'اطلاعات زیر را برای ایجاد فروشگاه تکمیل کنید',
    creatingShop: 'در حال ایجاد فروشگاه...',
    shopCreatedSuccessfully: 'فروشگاه با موفقیت ایجاد شد!',

    // Form fields
    basicInformation: 'اطلاعات پایه',
    contactInformation: 'اطلاعات تماس',
    nameEn: 'نام فروشگاه (انگلیسی)',
    nameEnPlaceholder: 'نام فروشگاه را به انگلیسی وارد کنید',
    nameFa: 'نام فروشگاه (فارسی)',
    nameFaPlaceholder: 'نام فروشگاه را به فارسی وارد کنید',
    descriptionEn: 'توضیحات (انگلیسی)',
    descriptionEnPlaceholder: 'فروشگاه خود را به انگلیسی توضیح دهید',
    descriptionFa: 'توضیحات (فارسی)',
    descriptionFaPlaceholder: 'فروشگاه خود را به فارسی توضیح دهید',
    email: 'ایمیل',
    emailPlaceholder: 'shop@example.com',
    phone: 'تلفن',
    phonePlaceholder: '09123456789',
    city: 'شهر',
    cityPlaceholder: 'شهر خود را وارد کنید',
    address: 'آدرس',
    addressPlaceholder: 'آدرس خود را وارد کنید',

    // Shop status
    active: 'فعال',
    inactive: 'غیرفعال',
    verified: 'تأیید شده',

    // Shop listing
    allShops: 'همه فروشگاه‌ها',
    discoverGreatShops: 'فروشگاه‌ها و محصولات عالی را کشف کنید',
    searchShops: 'جستجو در فروشگاه‌ها...',
    filterByCity: 'فیلتر بر اساس شهر...',
    noShopsFound: 'فروشگاهی یافت نشد',
    noShopsYet: 'هنوز فروشگاهی وجود ندارد',
    tryDifferentSearch: 'عبارات جستجوی خود را تغییر دهید',
    noShopsFoundDescription:
      'اولین نفری باشید که فروشگاه در پلتفرم ما ایجاد می‌کند',
    createFirstShop: 'ایجاد اولین فروشگاه',
    showingResults: 'نمایش {count} از {total} فروشگاه',

    // Shop details
    products: 'محصولات',
    rating: 'امتیاز',
    totalSales: 'کل فروش',
    totalProducts: 'کل محصولات',
    memberSince: 'عضو از',
    contactSeller: 'تماس با فروشنده',
    followShop: 'دنبال کردن فروشگاه',
    viewShop: 'مشاهده فروشگاه',
    manage: 'مدیریت',

    // Shop policies
    policies: 'قوانین فروشگاه',
    shipping: 'ارسال',
    returns: 'بازگشت کالا',
    businessHours: 'ساعات کاری',
    shopStats: 'آمار فروشگاه',

    // Product related
    noProducts: 'هنوز محصولی وجود ندارد',
    noProductsDescription: 'این فروشگاه هنوز محصولی اضافه نکرده است',

    // Dashboard
    myShops: 'فروشگاه‌های من',
    manageYourShops: 'فروشگاه‌های خود را مدیریت و نظارت کنید',
    createAnotherShop: 'ایجاد فروشگاه دیگر',
    expandYourBusiness: 'کسب و کار خود را با چندین فروشگاه گسترش دهید',
    startYourBusinessToday: 'امروز سفر کسب و کار خود را شروع کنید',
    totalShops: 'کل فروشگاه‌ها',
    acrossAllShops: 'در همه فروشگاه‌ها',
    allTimeTotal: 'کل تمام دوران',
    avgRating: 'میانگین امتیاز',
    outOfFive: 'از 5',
    daysActive: 'روزهای فعال',

    // Warnings
    shopInactiveWarning: 'فروشگاه در حال حاضر غیرفعال است',
    shopNotVerifiedWarning: 'فروشگاه هنوز تأیید نشده است',
  },
  upload: {
    dragOrClick: 'فایل‌ها را اینجا بکشید یا کلیک کنید',
    fileTooLarge: 'حجم فایل زیاد است',
    uploadFailed: 'آپلود ناموفق بود',
    deleteFailed: 'حذف ناموفق بود',
    uploadImage: 'آپلود تصویر',
    uploadImages: 'آپلود تصاویر',
    removeImage: 'حذف تصویر',
    mainImage: 'تصویر اصلی',
  },
  marketplace: {
    title: 'فروشگاه',
    subtitle: 'محصولات و حراجی‌های شگفت‌انگیز را کشف کنید',
    searchPlaceholder: 'جستجوی محصولات...',
    browseCategories: 'مرور دسته‌بندی‌ها',
    featuredProducts: 'محصولات ویژه',
    searchResults: 'نتایج جستجو',
    categories: 'دسته‌بندی‌ها',
    allCategories: 'همه دسته‌بندی‌ها',
    products: 'محصولات',

    auction: 'حراجی',
    buyNow: 'خرید فوری',
    addToCart: 'افزودن به سبد',
    placeBid: 'پیشنهاد قیمت',
    currentBid: 'قیمت فعلی',
    startingPrice: 'قیمت شروع',
    inStock: 'موجود',
    outOfStock: 'ناموجود',
    noProductsFound: 'محصولی یافت نشد',
    noProductsInCategory: 'محصولی در این دسته‌بندی وجود ندارد',
    shopNoProducts: 'این فروشگاه هنوز محصولی ندارد',
    auctionEnded: 'حراجی پایان یافته',

    filters: 'فیلترها',
    productType: 'نوع محصول',
    allProducts: 'همه محصولات',
    auctions: 'حراجی‌ها',
    priceRange: 'محدوده قیمت',
    min: 'حداقل',
    max: 'حداکثر',
    sortBy: 'مرتب‌سازی',
    newest: 'جدیدترین',
    priceLowToHigh: 'قیمت: کم به زیاد',
    priceHighToLow: 'قیمت: زیاد به کم',
    endingSoon: 'در حال اتمام',
    additionalFilters: 'فیلترهای اضافی',
    inStockOnly: 'فقط موجود',
    endingIn24h: 'اتمام در ۲۴ ساعت',
    applyFilters: 'اعمال فیلترها',

    verified: 'تایید شده',
    memberSince: 'عضو از',

    minimumBid: 'حداقل پیشنهاد',
    quickBid: 'پیشنهاد سریع',
    yourBid: 'پیشنهاد شما',
    confirmBid: 'تایید پیشنهاد',
    bidPlaced: 'پیشنهاد با موفقیت ثبت شد!',
    bidFailed: 'خطا در ثبت پیشنهاد',
    bidTooLow: 'پیشنهاد خیلی کم است',
    buyNowAvailable: 'یا خرید فوری با',

    noCategoriesFound: 'دسته‌بندی یافت نشد',
    ended: 'پایان یافته',
    winning: 'برنده',
    youAreWinning: 'شما برنده هستید',
    bids: 'پیشنهاد',
    loginToBid: 'برای پیشنهاد قیمت وارد شوید',
    loginToBuy: 'برای خرید وارد شوید',
    youWereOutbid: 'پیشنهاد بالاتری داده شد!',
    addedToCart: 'به سبد خرید اضافه شد',
  },
  products: {
    addProduct: 'افزودن محصول',
    editProduct: 'ویرایش محصول',
    deleteProduct: 'حذف محصول',
    productDetails: 'جزئیات محصول',
    productInformation: 'اطلاعات محصول',
    pricingAndInventory: 'قیمت و موجودی',
    auctionSettings: 'تنظیمات حراجی',

    productName: 'نام محصول',
    productNamePlaceholder: 'نام محصول را وارد کنید',
    productDescription: 'توضیحات محصول',
    productDescriptionPlaceholder: 'محصول خود را توضیح دهید...',
    selectCategory: 'انتخاب دسته‌بندی',
    selectShop: 'انتخاب فروشگاه',
    regularProduct: 'محصول عادی',
    auctionProduct: 'محصول حراجی',

    regularPrice: 'قیمت عادی',
    startingBid: 'قیمت شروع',
    bidIncrement: 'افزایش پیشنهاد',
    minimumIncrement: 'حداقل افزایش',
    buyNowPrice: 'قیمت خرید فوری',
    enableBuyNow: 'فعالسازی خرید فوری',

    auctionDuration: 'مدت حراجی',
    auctionStartDate: 'تاریخ شروع',
    auctionEndDate: 'تاریخ پایان',
    days: 'روز',
    hours: 'ساعت',
    minutes: 'دقیقه',

    publish: 'انتشار',
    draft: 'پیش‌نویس',
    published: 'منتشر شده',
    unpublished: 'منتشر نشده',
    active: 'فعال',
    inactive: 'غیرفعال',

    nameRequired: 'نام محصول الزامی است',
    categoryRequired: 'دسته‌بندی الزامی است',
    priceRequired: 'قیمت الزامی است',
    stockRequired: 'موجودی الزامی است',
    startingBidRequired: 'قیمت شروع الزامی است',
    incrementRequired: 'افزایش پیشنهاد الزامی است',
    durationRequired: 'مدت حراجی الزامی است',
    invalidPrice: 'قیمت نامعتبر',
    invalidStock: 'موجودی نامعتبر',

    productAdded: 'محصول با موفقیت اضافه شد',
    productUpdated: 'محصول با موفقیت بروزرسانی شد',
    productDeleted: 'محصول با موفقیت حذف شد',
    productNotFound: 'محصول یافت نشد',
    updateFailed: 'خطا در بروزرسانی محصول',
    deleteFailed: 'خطا در حذف محصول',
  },
  validation: {
    required: 'این فیلد الزامی است',
    invalid: 'مقدار نامعتبر',
    tooShort: 'خیلی کوتاه',
    tooLong: 'خیلی طولانی',
    invalidFormat: 'فرمت نامعتبر',
    mustBeNumber: 'باید عدد باشد',
    mustBePositive: 'باید مثبت باشد',
    minValue: 'حداقل مقدار {min}',
    maxValue: 'حداکثر مقدار {max}',
    invalidEmail: 'آدرس ایمیل نامعتبر',
    invalidPhone: 'شماره تلفن نامعتبر',
    selectOption: 'لطفا یک گزینه انتخاب کنید',
    atLeastOne: 'حداقل یکی را انتخاب کنید',
  },
  nav: {
    main: 'Main',
    marketplace: 'Marketplace',
    categories: 'Categories',
    shops: 'Shops',
    dashboard: 'Dashboard',
    orders: 'Orders',
    bids: 'Bids',
    wishlist: 'Wishlist',
    myShop: 'My Shop',
    overview: 'Overview',
    profile: 'Profile',
    settings: 'Settings',
    account: 'Account',
    selling: 'Selling',
    createShop: 'Create Shop',
    backToDashboard: 'Back to Dashboard',
  },
  shop: {
    management: 'Management',
    overview: 'Overview',
    products: 'Products',
    allProducts: 'All Products',
    addProduct: 'Add Product',
    categories: 'Categories',
    orders: 'Orders',
    auctions: 'Auctions',
    insights: 'Insights',
    analytics: 'Analytics',
    revenue: 'Revenue',
    configuration: 'Configuration',
    settings: 'Settings',
    viewStorefront: 'View Storefront',
  },
  cart: {
    title: 'سبد خرید',
    empty: 'سبد خرید شما خالی است',
    continueShopping: 'ادامه خرید',
    total: 'جمع کل',
    clear: 'خالی کردن سبد',
    checkout: 'تسویه حساب',
    yourBid: 'پیشنهاد شما:',
    lowStock: 'فقط {{count}} عدد باقی مانده',
    addToCart: 'افزودن به سبد',
    adding: 'در حال افزودن...',
    added: 'اضافه شد!',
    inCart: 'در سبد خرید',
    addedToCart: 'به سبد خرید اضافه شد!',
  },
  orders: {
    checkout: 'تسویه حساب',
    orderSummary: 'خلاصه سفارش',
    items: 'آیتم‌ها',
    total: 'جمع کل',
    subtotal: 'جمع جزء',
    shipping: 'هزینه ارسال',
    free: 'رایگان',
    shippingAddress: 'آدرس ارسال',
    fullName: 'نام کامل',
    fullNamePlaceholder: 'علی محمدی',
    phoneNumber: 'شماره تلفن',
    address: 'آدرس',
    addressPlaceholder: 'خیابان، کوچه، پلاک، واحد',
    city: 'شهر',
    cityPlaceholder: 'تهران',
    postalCode: 'کد پستی',
    placeOrder: 'ثبت سفارش',
    placingOrder: 'در حال ثبت سفارش...',
    orderNumber: 'سفارش #{id}',
    soldBy: 'فروشنده',
    auctionWin: 'برنده مزایده',
    quantity: 'تعداد',
    payNow: 'پرداخت',
    processing: 'در حال پردازش...',
    cancel: 'لغو',
    confirmCancel: 'آیا از لغو این سفارش اطمینان دارید؟',
    paidAt: 'پرداخت شده در {date}',
    myOrders: 'سفارش‌های من',
    noOrders: 'هنوز سفارشی ندارید',
    startShopping: 'شروع خرید',
    viewDetails: 'مشاهده جزئیات',
    paymentSuccessful: 'پرداخت موفق!',
    thankYouOrder: 'از سفارش شما متشکریم. پرداخت شما دریافت شد.',
    paymentDate: 'تاریخ پرداخت',
    shippingTo: 'ارسال به',
    whatNext: 'مراحل بعدی',
    confirmationEmail: 'ایمیل تأیید سفارش دریافت خواهید کرد',
    preparingOrder: 'سفارش شما در حال آماده‌سازی برای ارسال است',
    trackingInfo: 'اطلاعات رهگیری پس از ارسال ارسال خواهد شد',
    viewOrder: 'مشاهده سفارش',
    continueShopping: 'ادامه خرید',
  },
  landing: {
    // Hero Section
    badge: 'پروژه نمونه کار',
    title: 'پلتفرم تجارت الکترونیک',
    subtitle:
      'سلام! 👋 این یک صفحه معمولی نیست. من یک پلتفرم تجارت الکترونیک full-stack ساخته‌ام تا مهارت‌های فنی خودم رو نشون بدم. خوشحال میشم ویژگی‌های پروژه رو بررسی کنید و ببینید چه چیزهایی می‌تونم بسازم.',
    exploreButton: 'مشاهده پلتفرم',
    sourceCodeButton: 'مشاهده کد منبع',
    contactButton: 'تماس با من',

    // Stats
    stats: {
      features: 'ویژگی‌های اصلی',
      featuresCount: '۳',
      fullStack: 'Full-Stack',
      fullStackValue: '۱۰۰٪',
      techStack: 'پشته فناوری',
      techStackValue: 'مدرن',
      design: 'طراحی',
      designValue: 'واکنش‌گرا',
    },

    // Features Section
    featuresTitle: 'چه چیزی ساختم',
    featuresSubtitle:
      'یک راه‌حل جامع تجارت الکترونیک که بهترین شیوه‌های توسعه وب مدرن و طراحی تجربه کاربری را نمایش می‌دهد.',

    // Feature Cards
    multiVendor: {
      title: 'فروشگاه‌های چند فروشنده',
      description:
        'کاربران می‌توانند فروشگاه خود را ایجاد کنند، ویترین را سفارشی کنند و کاتالوگ محصولات خود را با داشبورد کاربرپسند مدیریت کنند.',
      point1: 'سفارشی‌سازی فروشگاه',
      point2: 'مدیریت محصولات',
      point3: 'داشبورد تحلیلی',
    },

    orderFlow: {
      title: 'سبد خرید کامل',
      description:
        'عملکرد کامل سبد خرید با پشتیبانی از خرید مهمان، ذخیره‌سازی دائمی سبد و تجربه کاربری یکپارچه.',
      point1: 'سبد خرید با پشتیبانی مهمان',
      point2: 'ذخیره‌سازی دائمی سبد',
      point3: 'ردیابی قیمت و اعتبارسنجی',
    },

    auction: {
      title: 'سیستم حراج زنده',
      description:
        'پلتفرم مزایده بلادرنگ که کاربران می‌توانند اقلام را برای حراج لیست کنند و در مزایده رقابتی با اعتبارسنجی خودکار شرکت کنند.',
      point1: 'مزایده بلادرنگ',
      point2: 'مدیریت حراج',
      point3: 'افزایش خودکار پیشنهاد',
    },

    // Technical Section
    technicalTitle: 'پیاده‌سازی فنی',
    technicalSubtitle:
      'ساخته شده با تکنولوژی‌های مدرن و بهترین شیوه‌ها برای نمایش توانایی‌های توسعه full-stack.',

    // Tech Stack
    frontend: {
      title: 'Frontend',
      item1: 'TanStack Start و Router',
      item2: 'TypeScript برای Type Safety',
      item3: 'Tailwind CSS و Shadcn UI',
      item4: 'Jotai برای مدیریت state',
    },

    backend: {
      title: 'Backend و پایگاه داده',
      item1: 'Server Functions (سبک RPC)',
      item2: 'Drizzle ORM با PostgreSQL',
      item3: 'احراز هویت با sessions',
      item4: 'سیستم آپلود فایل',
    },

    keyFeatures: {
      title: 'ویژگی‌های کلیدی',
      item1: 'پشتیبانی چند زبانه (انگلیسی/فارسی)',
      item2: 'طراحی واکنش‌گرا RTL/LTR',
      item3: 'احراز هویت با OTP پیامکی',
      item4: 'بهینه‌سازی SEO و عملکرد',
    },

    // Why This Project
    whyProject: {
      title: 'چرا این پروژه؟',
      description:
        'این پروژه توانایی من در ساخت اپلیکیشن‌های پیچیده و واقعی با جریان‌های کاربری متعدد، روابط داده‌ای و تکنولوژی‌های وب مدرن شامل بین‌المللی‌سازی و پشتیبانی از متن دوجهته را نشان می‌دهد.',
    },

    // CTA Section
    ctaTitle: 'آماده دیدن بیشتر هستید؟',
    ctaSubtitle:
      'پلتفرم زنده را کاوش کنید، کد را بررسی کنید، یا برای بحث درباره اینکه چطور می‌تونم به تیم شما کمک کنم با من تماس بگیرید.',
    tryPlatformButton: 'امتحان پلتفرم',
    githubButton: 'مشاهده در GitHub',
  },
}

export default fa
