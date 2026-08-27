import { Product, Listing, ProductAggregate, ProductCategory } from '../types/catalog';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Chips & Wafers',
  'Namkeen & Bhujia',
  'Instant Food',
  'Biscuits & Cookies',
  'Chocolates & Sweets',
  'Cold Drinks & Juices',
  'Energy & Health Drinks',
  'Dairy & Milk-Based',
  'Ice Cream & Frozen Desserts',
  'Bread, Buns & Bakery',
];

export const MOCK_PRODUCTS: Product[] = [
  // ─── CHIPS & WAFERS ──────────────────────────────────────────
  {
    id: 'lays-chips',
    name: "Lay's Classic Salted",
    category: 'Chips & Wafers',
    subcategory: "Lay's",
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'lunch_dining',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    description: 'Crispy salted potato chips.',
  },
  {
    id: 'lays-magic-masala',
    name: "Lay's Magic Masala",
    category: 'Chips & Wafers',
    subcategory: "Lay's",
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'local_fire_department',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    description: 'Spicy Indian Magic Masala potato chips.',
  },
  {
    id: 'lays-spanish-tomato',
    name: "Lay's Spanish Tomato Tango",
    category: 'Chips & Wafers',
    subcategory: "Lay's",
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'nutrition',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    description: 'Sweet and tangy tomato flavoured potato chips.',
  },
  {
    id: 'lays-cream-onion',
    name: "Lay's American Cream & Onion",
    category: 'Chips & Wafers',
    subcategory: "Lay's",
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'set_meal',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    description: 'Smooth sour cream & onion flavoured chips.',
  },
  {
    id: 'uncle-chipps',
    name: 'Uncle Chipps',
    category: 'Chips & Wafers',
    subcategory: 'Uncle Chipps',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'lunch_dining',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    description: 'Classic spicy crinkle cut Uncle Chipps.',
  },
  {
    id: 'bingo-original',
    name: 'Bingo Original',
    category: 'Chips & Wafers',
    subcategory: 'Bingo',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'category',
    imageUrl: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?auto=format&fit=crop&w=800&q=80',
    description: 'Crunchy salted potato chips.',
  },
  {
    id: 'pringles',
    name: 'Pringles',
    category: 'Chips & Wafers',
    subcategory: 'Pringles',
    variants: [{ size: '100g', mrp: 110 }],

    mrp: 110,
    iconName: 'inventory_2',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    description: 'Stackable potato crisp canister.',
  },
  {
    id: 'kurkure',
    name: 'Kurkure Masala Munch',
    category: 'Chips & Wafers',
    subcategory: 'Kurkure',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'local_fire_department',
    imageUrl: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=800&q=80',
    description: 'Crunchy tedhe-medhe masala corn puffs.',
  },
  {
    id: 'kurkure-green-chutney',
    name: 'Kurkure Green Chutney',
    category: 'Chips & Wafers',
    subcategory: 'Kurkure',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'grass',
    imageUrl: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=800&q=80',
    description: 'Zesty green chutney flavoured snacks.',
  },
  {
    id: 'kurkure-solid-masti',
    name: 'Kurkure Solid Masti',
    category: 'Chips & Wafers',
    subcategory: 'Kurkure',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'star',
    imageUrl: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=800&q=80',
    description: 'Twisted crunchy masala rolls.',
  },
  {
    id: 'bingo-mad-angles',
    name: 'Bingo Mad Angles',
    category: 'Chips & Wafers',
    subcategory: 'Bingo Mad Angles',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'change_history',
    imageUrl: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?auto=format&fit=crop&w=800&q=80',
    description: 'Achaari Masti crunchy triangle corn chips.',
  },
  {
    id: 'too-yumm-multigrain',
    name: 'Too Yumm Multigrain',
    category: 'Chips & Wafers',
    subcategory: 'Too Yumm',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'grain',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    description: 'Baked healthy multigrain chips.',
  },
  {
    id: 'too-yumm-peri-peri',
    name: 'Too Yumm Peri Peri',
    category: 'Chips & Wafers',
    subcategory: 'Too Yumm',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'local_fire_department',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    description: 'Spicy peri-peri baked chips.',
  },
  {
    id: 'doritos',
    name: 'Doritos Nacho Cheese',
    category: 'Chips & Wafers',
    subcategory: 'Doritos',
    variants: [{ size: '50g', mrp: 30 }],

    mrp: 30,
    iconName: 'details',
    imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=800&q=80',
    description: 'Bold cheesy tortilla corn chips.',
  },
  {
    id: 'doritos-tangy-tomato',
    name: 'Doritos Tangy Tomato',
    category: 'Chips & Wafers',
    subcategory: 'Doritos',
    variants: [{ size: '50g', mrp: 30 }],

    mrp: 30,
    iconName: 'details',
    imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=800&q=80',
    description: 'Tangy tomato tortilla chips.',
  },
  {
    id: 'cornitos',
    name: 'Cornitos Nacho Chips',
    category: 'Chips & Wafers',
    subcategory: 'Cornitos',
    variants: [{ size: '100g', mrp: 40 }],

    mrp: 40,
    iconName: 'change_history',
    imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=800&q=80',
    description: 'Mexican seasoned corn nacho chips.',
  },

  // ─── NAMKEEN & BHUJIA ──────────────────────────────────────────
  {
    id: 'haldirams-bhujia',
    name: "Haldiram's Aloo Bhujia",
    category: 'Namkeen & Bhujia',
    subcategory: 'Bhujia & Mixture',
    variants: [{ size: '100g', mrp: 35 }],

    mrp: 35,
    iconName: 'grain',
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
    description: 'Spicy classic Haldiram Aloo Bhujia namkeen.',
  },
  {
    id: 'haldirams-bikaneri-bhujia',
    name: "Haldiram's Bikaneri Bhujia",
    category: 'Namkeen & Bhujia',
    subcategory: 'Bhujia & Mixture',
    variants: [{ size: '100g', mrp: 35 }],

    mrp: 35,
    iconName: 'grain',
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
    description: 'Crispy moth bean Bikaneri bhujia.',
  },
  {
    id: 'bikaji-bhujia',
    name: 'Bikaji Bhujia',
    category: 'Namkeen & Bhujia',
    subcategory: 'Bhujia & Mixture',
    variants: [{ size: '100g', mrp: 35 }],

    mrp: 35,
    iconName: 'grain',
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
    description: 'Authentic Rajasthani Bikaji Bhujia.',
  },
  {
    id: 'haldirams-navratan-mix',
    name: "Haldiram's Navratan Mix",
    category: 'Namkeen & Bhujia',
    subcategory: 'Bhujia & Mixture',
    variants: [{ size: '100g', mrp: 35 }],

    mrp: 35,
    iconName: 'grid_view',
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
    description: 'Sweet and spicy mix of nuts, pulses, and bhujia.',
  },
  {
    id: 'haldirams-punjabi-tadka',
    name: "Haldiram's Punjabi Tadka",
    category: 'Namkeen & Bhujia',
    subcategory: 'Bhujia & Mixture',
    variants: [{ size: '100g', mrp: 35 }],

    mrp: 35,
    iconName: 'local_fire_department',
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
    description: 'Extra spicy Punjabi style seasoned snack mix.',
  },
  {
    id: 'bikaji-bikaneri-mixture',
    name: 'Bikaji Bikaneri Mixture',
    category: 'Namkeen & Bhujia',
    subcategory: 'Bhujia & Mixture',
    variants: [{ size: '100g', mrp: 35 }],

    mrp: 35,
    iconName: 'grain',
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional Bikaneri spicy mixture pack.',
  },
  {
    id: 'haldirams-masala-peanuts',
    name: "Haldiram's Masala Peanuts",
    category: 'Namkeen & Bhujia',
    subcategory: 'Roasted Snacks',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'blur_circular',
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
    description: 'Spicy batter coated fried peanuts.',
  },
  {
    id: 'dfm-roasted-chana',
    name: 'DFM Roasted Chana',
    category: 'Namkeen & Bhujia',
    subcategory: 'Roasted Snacks',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'grain',
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80',
    description: 'Crunchy salted roasted chickpeas.',
  },

  // ─── INSTANT FOOD ──────────────────────────────────────────
  {
    id: 'maggi',
    name: 'Maggi 2-Min Masala',
    category: 'Instant Food',
    subcategory: 'Noodles',
    variants: [{ size: '25g', mrp: 14 }],

    mrp: 14,
    iconName: 'ramen_dining',
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    description: '2-Minute Masala Noodles. The ultimate late-night study fuel.',
  },
  {
    id: 'maggi-chicken',
    name: 'Maggi 2-Min Chicken',
    category: 'Instant Food',
    subcategory: 'Noodles',
    variants: [{ size: '50g', mrp: 25 }],

    mrp: 25,
    iconName: 'ramen_dining',
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    description: 'Savory chicken flavoured instant noodles.',
  },
  {
    id: 'yippee',
    name: 'Yippee Magic Masala',
    category: 'Instant Food',
    subcategory: 'Noodles',
    variants: [{ size: '25g', mrp: 15 }],

    mrp: 15,
    iconName: 'ramen_dining',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
    description: 'Sunfeast Yippee long non-sticky noodles.',
  },
  {
    id: 'top-ramen',
    name: 'Top Ramen',
    category: 'Instant Food',
    subcategory: 'Noodles',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'ramen_dining',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    description: 'Top Ramen curry masala instant noodles.',
  },
  {
    id: 'cup-noodles',
    name: 'Nissin Cup Noodles',
    category: 'Instant Food',
    subcategory: 'Noodles',
    variants: [{ size: '100g', mrp: 50 }],

    mrp: 50,
    iconName: 'soup_kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    description: 'Instant Spicy Garlic Seafood/Veg Cup Noodles.',
  },
  {
    id: 'chings-noodles',
    name: "Ching's Secret Noodles",
    category: 'Instant Food',
    subcategory: 'Noodles',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'ramen_dining',
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    description: 'Desi Chinese spicy Schezwan instant noodles.',
  },
  {
    id: 'maggi-oats-noodles',
    name: 'Maggi Oats Noodles',
    category: 'Instant Food',
    subcategory: 'Noodles',
    variants: [{ size: '50g', mrp: 25 }],

    mrp: 25,
    iconName: 'ramen_dining',
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    description: 'Healthy grain oats masala noodles.',
  },
  {
    id: 'mtr-poha-upma',
    name: 'MTR Poha / Upma',
    category: 'Instant Food',
    subcategory: 'Ready-to-Eat',
    variants: [{ size: '50g', mrp: 30 }],

    mrp: 30,
    iconName: 'set_meal',
    imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80',
    description: 'Just add hot water instant breakfast cup.',
  },
  {
    id: 'oats',
    name: 'Yoga Bar Instant Oats',
    category: 'Instant Food',
    subcategory: 'Ready-to-Eat',
    variants: [{ size: '50g', mrp: 30 }],

    mrp: 30,
    iconName: 'set_meal',
    imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80',
    description: 'Wholesome instant masala oats pouch.',
  },
  {
    id: 'maggi-pazzta',
    name: 'Maggi Pazzta',
    category: 'Instant Food',
    subcategory: 'Ready-to-Eat',
    variants: [{ size: '50g', mrp: 30 }],

    mrp: 30,
    iconName: 'dinner_dining',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
    description: 'Instant Cheese Macaroni / Masala Penne Pasta.',
  },

  // ─── BISCUITS & COOKIES ──────────────────────────────────────────
  {
    id: 'parle-g',
    name: 'Parle-G',
    category: 'Biscuits & Cookies',
    subcategory: 'Everyday & Tea Biscuits',
    variants: [{ size: '25g', mrp: 10 }],

    mrp: 10,
    iconName: 'cookie',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Original iconic Glucose biscuits for chai time.',
  },
  {
    id: 'marie-gold',
    name: 'Britannia Marie Gold',
    category: 'Biscuits & Cookies',
    subcategory: 'Everyday & Tea Biscuits',
    variants: [{ size: '25g', mrp: 15 }],

    mrp: 15,
    iconName: 'cookie',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Crispy light tea biscuits.',
  },
  {
    id: 'tiger-krunch',
    name: 'Tiger Krunch',
    category: 'Biscuits & Cookies',
    subcategory: 'Everyday & Tea Biscuits',
    variants: [{ size: '25g', mrp: 10 }],

    mrp: 10,
    iconName: 'cookie',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Choco crunch biscuits.',
  },
  {
    id: 'krackjack',
    name: 'Krackjack',
    category: 'Biscuits & Cookies',
    subcategory: 'Everyday & Tea Biscuits',
    variants: [{ size: '25g', mrp: 15 }],

    mrp: 15,
    iconName: 'cookie',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Original sweet and salty biscuit.',
  },
  {
    id: 'oreo',
    name: 'Oreo Original',
    category: 'Biscuits & Cookies',
    subcategory: 'Cream & Choco',
    variants: [{ size: '50g', mrp: 30 }],

    mrp: 30,
    iconName: 'cookie',
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    description: 'Chocolate Sandwich Cookies with Vanilla Cream.',
  },
  {
    id: 'oreo-choco-creme',
    name: 'Oreo Choco Crème',
    category: 'Biscuits & Cookies',
    subcategory: 'Cream & Choco',
    variants: [{ size: '50g', mrp: 30 }],

    mrp: 30,
    iconName: 'cookie',
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    description: 'Double chocolate sandwich cookies.',
  },
  {
    id: 'bourbon',
    name: 'Britannia Bourbon',
    category: 'Biscuits & Cookies',
    subcategory: 'Cream & Choco',
    variants: [{ size: '50g', mrp: 25 }],

    mrp: 25,
    iconName: 'cookie',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    description: 'Rich chocolate cream biscuits with sugar crystals.',
  },
  {
    id: 'dark-fantasy',
    name: 'Dark Fantasy Choco Fills',
    category: 'Biscuits & Cookies',
    subcategory: 'Cream & Choco',
    variants: [{ size: '100g', mrp: 40 }],

    mrp: 40,
    iconName: 'cookie',
    imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    description: 'Sunfeast Dark Fantasy cookies filled with molten chocolate.',
  },
  {
    id: 'dark-fantasy-truffle',
    name: 'Dark Fantasy Truffle',
    category: 'Biscuits & Cookies',
    subcategory: 'Cream & Choco',
    variants: [{ size: '100g', mrp: 50 }],

    mrp: 50,
    iconName: 'cookie',
    imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    description: 'Premium chocolate truffle filled dessert cookie.',
  },
  {
    id: 'hide-seek-fab',
    name: 'Hide & Seek Fab / Bourbon',
    category: 'Biscuits & Cookies',
    subcategory: 'Cream & Choco',
    variants: [{ size: '50g', mrp: 30 }],

    mrp: 30,
    iconName: 'cookie',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    description: 'Choco chip filled cream sandwich biscuits.',
  },
  {
    id: 'farmlite-digestive',
    name: 'Sunfeast Farmlite Digestive',
    category: 'Biscuits & Cookies',
    subcategory: 'Healthy & Digestive',
    variants: [{ size: '100g', mrp: 35 }],

    mrp: 35,
    iconName: 'cookie',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'High fibre wholewheat digestive biscuits.',
  },
  {
    id: 'mcvities-digestive',
    name: "McVitie's Digestive",
    category: 'Biscuits & Cookies',
    subcategory: 'Healthy & Digestive',
    variants: [{ size: '100g', mrp: 40 }],

    mrp: 40,
    iconName: 'cookie',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Classic British wheat digestive biscuits.',
  },
  {
    id: 'good-day-cashew',
    name: 'Good Day Cashew / Butter',
    category: 'Biscuits & Cookies',
    subcategory: 'Premium Cookies',
    variants: [{ size: '50g', mrp: 30 }],

    mrp: 30,
    iconName: 'cookie',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Rich butter cookies loaded with cashew nuts.',
  },
  {
    id: 'unibic-cookies',
    name: 'Unibic Cookies',
    category: 'Biscuits & Cookies',
    subcategory: 'Premium Cookies',
    variants: [{ size: '100g', mrp: 40 }],

    mrp: 40,
    iconName: 'cookie',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Choco Chip / Butter Crunch gourmet cookies.',
  },

  // ─── CHOCOLATES & SWEETS ──────────────────────────────────────────
  {
    id: 'dairy-milk-silk',
    name: 'Cadbury Dairy Milk Silk',
    category: 'Chocolates & Sweets',
    subcategory: 'Chocolate Bars',
    variants: [{ size: '100g', mrp: 80 }],

    mrp: 80,
    iconName: 'cake',
    imageUrl: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra smooth and creamy milk chocolate bar.',
  },
  {
    id: 'dairy-milk-fruit-nut',
    name: 'Cadbury Dairy Milk Fruit & Nut',
    category: 'Chocolates & Sweets',
    subcategory: 'Chocolate Bars',
    variants: [{ size: '100g', mrp: 90 }],

    mrp: 90,
    iconName: 'cake',
    imageUrl: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80',
    description: 'Silk chocolate embedded with raisins and almonds.',
  },
  {
    id: 'dairy-milk-crackle',
    name: 'Cadbury Dairy Milk Crackle',
    category: 'Chocolates & Sweets',
    subcategory: 'Chocolate Bars',
    variants: [{ size: '100g', mrp: 90 }],

    mrp: 90,
    iconName: 'cake',
    imageUrl: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80',
    description: 'Milk chocolate filled with crispy rice crackles.',
  },
  {
    id: 'milkybar',
    name: 'Nestlé Milkybar',
    category: 'Chocolates & Sweets',
    subcategory: 'Chocolate Bars',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'cake',
    imageUrl: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80',
    description: 'Classic creamy white chocolate bar.',
  },
  {
    id: 'kitkat',
    name: 'KitKat 4-Finger',
    category: 'Chocolates & Sweets',
    subcategory: 'Chocolate Bars',
    variants: [{ size: '50g', mrp: 30 }],

    mrp: 30,
    iconName: 'cake',
    imageUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
    description: 'Crispy wafer fingers covered in smooth milk chocolate.',
  },
  {
    id: 'kitkat-chunky',
    name: 'KitKat Chunky',
    category: 'Chocolates & Sweets',
    subcategory: 'Chocolate Bars',
    variants: [{ size: '100g', mrp: 50 }],

    mrp: 50,
    iconName: 'cake',
    imageUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
    description: 'Big thick wafer bar coated in thick milk chocolate.',
  },
  {
    id: 'munch',
    name: 'Munch',
    category: 'Chocolates & Sweets',
    subcategory: 'Chocolate Bars',
    variants: [{ size: '25g', mrp: 10 }],

    mrp: 10,
    iconName: 'cake',
    imageUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
    description: 'Extra crunchy coated wafer bar.',
  },
  {
    id: 'perk',
    name: 'Perk',
    category: 'Chocolates & Sweets',
    subcategory: 'Chocolate Bars',
    variants: [{ size: '25g', mrp: 10 }],

    mrp: 10,
    iconName: 'cake',
    imageUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
    description: 'Light chocolate wafer bar.',
  },
  {
    id: 'snickers',
    name: 'Snickers',
    category: 'Chocolates & Sweets',
    subcategory: 'Chocolate Bars',
    variants: [{ size: '100g', mrp: 40 }],

    mrp: 40,
    iconName: 'cake',
    imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=800&q=80',
    description: 'Hunger busting roasted peanut, caramel and nougat bar.',
  },
  {
    id: 'five-star',
    name: 'Cadbury 5 Star',
    category: 'Chocolates & Sweets',
    subcategory: 'Chocolate Bars',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'cake',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    description: 'Chewy caramel and nougat chocolate bar.',
  },
  {
    id: 'gems',
    name: 'Cadbury Gems',
    category: 'Chocolates & Sweets',
    subcategory: 'Gems & Candies',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'radio_button_checked',
    imageUrl: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80',
    description: 'Colorful sugar coated chocolate buttons.',
  },
  {
    id: 'm-and-ms',
    name: "M&M's",
    category: 'Chocolates & Sweets',
    subcategory: 'Gems & Candies',
    variants: [{ size: '100g', mrp: 80 }],

    mrp: 80,
    iconName: 'radio_button_checked',
    imageUrl: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80',
    description: 'Milk chocolate candy coated buttons.',
  },

  // ─── COLD DRINKS & JUICES ──────────────────────────────────────────
  {
    id: 'coca-cola',
    name: 'Coca-Cola',
    category: 'Cold Drinks & Juices',
    subcategory: 'Carbonated Soft Drinks',
    variants: [{ size: '100g', mrp: 40 }],

    mrp: 40,
    iconName: 'local_drink',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    description: 'Ice cold 250ml Coca Cola carbonated drink.',
  },
  {
    id: 'thums-up',
    name: 'Thums Up',
    category: 'Cold Drinks & Juices',
    subcategory: 'Carbonated Soft Drinks',
    variants: [{ size: '100g', mrp: 40 }],

    mrp: 40,
    iconName: 'local_drink',
    imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80',
    description: 'Strong fizzy cola with taste of thunder.',
  },
  {
    id: 'pepsi',
    name: 'Pepsi',
    category: 'Cold Drinks & Juices',
    subcategory: 'Carbonated Soft Drinks',
    variants: [{ size: '100g', mrp: 40 }],

    mrp: 40,
    iconName: 'local_drink',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    description: 'Refreshing carbonated cola beverage.',
  },
  {
    id: 'sprite',
    name: 'Sprite',
    category: 'Cold Drinks & Juices',
    subcategory: 'Carbonated Soft Drinks',
    variants: [{ size: '100g', mrp: 40 }],

    mrp: 40,
    iconName: 'local_drink',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    description: 'Crisp lemon-lime flavoured cold drink.',
  },
  {
    id: 'seven-up',
    name: '7Up',
    category: 'Cold Drinks & Juices',
    subcategory: 'Carbonated Soft Drinks',
    variants: [{ size: '100g', mrp: 40 }],

    mrp: 40,
    iconName: 'local_drink',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    description: 'Fizzy lemon lime soda.',
  },
  {
    id: 'limca',
    name: 'Limca',
    category: 'Cold Drinks & Juices',
    subcategory: 'Carbonated Soft Drinks',
    variants: [{ size: '100g', mrp: 40 }],

    mrp: 40,
    iconName: 'local_drink',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    description: 'Cloudy lemon cloud carbonated beverage.',
  },
  {
    id: 'frooti',
    name: 'Frooti',
    category: 'Cold Drinks & Juices',
    subcategory: 'Fruit Juices & Drinks',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'local_drink',
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
    description: 'Fresh Mango juice drink pack.',
  },
  {
    id: 'real-fruit-juice',
    name: 'Real Fruit Juice',
    category: 'Cold Drinks & Juices',
    subcategory: 'Fruit Juices & Drinks',
    variants: [{ size: '100g', mrp: 35 }],

    mrp: 35,
    iconName: 'local_drink',
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
    description: 'Real Mixed Fruit / Orange juice pack.',
  },
  {
    id: 'slice-mango',
    name: 'Slice Mango',
    category: 'Cold Drinks & Juices',
    subcategory: 'Fruit Juices & Drinks',
    variants: [{ size: '50g', mrp: 25 }],

    mrp: 25,
    iconName: 'local_drink',
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
    description: 'Thick mango drink.',
  },
  {
    id: 'maaza',
    name: 'Maaza',
    category: 'Cold Drinks & Juices',
    subcategory: 'Fruit Juices & Drinks',
    variants: [{ size: '50g', mrp: 25 }],

    mrp: 25,
    iconName: 'local_drink',
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
    description: 'Classic Alphonso mango fruit drink.',
  },
  {
    id: 'bisleri',
    name: 'Bisleri',
    category: 'Cold Drinks & Juices',
    subcategory: 'Water & Soda',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'water_drop',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    description: 'Packaged mineral water 1 Litre bottle.',
  },
  {
    id: 'bailley-soda',
    name: 'Bailley Soda',
    category: 'Cold Drinks & Juices',
    subcategory: 'Water & Soda',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'local_drink',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    description: 'Fizzy carbonated water soda.',
  },

  // ─── ENERGY & HEALTH DRINKS ──────────────────────────────────────────
  {
    id: 'red-bull',
    name: 'Red Bull',
    category: 'Energy & Health Drinks',
    subcategory: 'Energy Drinks',
    variants: [{ size: '100g', mrp: 125 }],

    mrp: 125,
    iconName: 'bolt',
    imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=800&q=80',
    description: '250ml Energy Drink. Vitalizes body & mind for late night coding.',
  },
  {
    id: 'sting',
    name: 'Sting',
    category: 'Energy & Health Drinks',
    subcategory: 'Energy Drinks',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'bolt',
    imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=800&q=80',
    description: 'High energy berry flavoured carbonated beverage.',
  },
  {
    id: 'monster-energy',
    name: 'Monster Energy',
    category: 'Energy & Health Drinks',
    subcategory: 'Energy Drinks',
    variants: [{ size: '100g', mrp: 125 }],

    mrp: 125,
    iconName: 'bolt',
    imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=800&q=80',
    description: '500ml high performance energy drink.',
  },
  {
    id: 'bournvita',
    name: 'Bournvita',
    category: 'Energy & Health Drinks',
    subcategory: 'Health Drink Mixes',
    variants: [{ size: '100g', mrp: 120 }],

    mrp: 120,
    iconName: 'local_cafe',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    description: 'Malt chocolate health drink powder pack.',
  },
  {
    id: 'horlicks',
    name: 'Horlicks',
    category: 'Energy & Health Drinks',
    subcategory: 'Health Drink Mixes',
    variants: [{ size: '100g', mrp: 120 }],

    mrp: 120,
    iconName: 'local_cafe',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    description: 'Malted milk nutritional powder.',
  },
  {
    id: 'complan',
    name: 'Complan',
    category: 'Energy & Health Drinks',
    subcategory: 'Health Drink Mixes',
    variants: [{ size: '100g', mrp: 120 }],

    mrp: 120,
    iconName: 'local_cafe',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    description: 'Royale Chocolate nutritional drink mix.',
  },

  // ─── DAIRY & MILK-BASED ──────────────────────────────────────────
  {
    id: 'amul-chocolate-milk',
    name: 'Amul Kool Chocolate',
    category: 'Dairy & Milk-Based',
    subcategory: 'Flavored Milk & Coffee',
    variants: [{ size: '50g', mrp: 30 }],

    mrp: 30,
    iconName: 'water_drop',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    description: 'Delicious chilled Amul Kool Koko chocolate drink.',
  },
  {
    id: 'amul-kool-kesar',
    name: 'Amul Kool Kesar',
    category: 'Dairy & Milk-Based',
    subcategory: 'Flavored Milk & Coffee',
    variants: [{ size: '50g', mrp: 30 }],

    mrp: 30,
    iconName: 'water_drop',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    description: 'Chilled saffron flavoured milk bottle.',
  },
  {
    id: 'nescafe-cold-coffee',
    name: 'Nescafé Cold Coffee',
    category: 'Dairy & Milk-Based',
    subcategory: 'Flavored Milk & Coffee',
    variants: [{ size: '100g', mrp: 50 }],

    mrp: 50,
    iconName: 'local_cafe',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    description: 'Rich creamy cold coffee can.',
  },
  {
    id: 'amul-lassi',
    name: 'Amul Masti Lassi',
    category: 'Dairy & Milk-Based',
    subcategory: 'Lassi & Yogurt',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'water_drop',
    imageUrl: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80',
    description: 'Sweet refreshing Rose Lassi pouch.',
  },
  {
    id: 'mother-dairy-lassi',
    name: 'Mother Dairy Lassi',
    category: 'Dairy & Milk-Based',
    subcategory: 'Lassi & Yogurt',
    variants: [{ size: '50g', mrp: 20 }],

    mrp: 20,
    iconName: 'water_drop',
    imageUrl: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80',
    description: 'Sweetened probiotic lassi pouch.',
  },
  {
    id: 'epigamia-greek-yogurt',
    name: 'Epigamia Greek Yogurt',
    category: 'Dairy & Milk-Based',
    subcategory: 'Lassi & Yogurt',
    variants: [{ size: '100g', mrp: 50 }],

    mrp: 50,
    iconName: 'icecream',
    imageUrl: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80',
    description: 'Wild Blueberry / Mango Greek Yogurt cup.',
  },
  {
    id: 'amul-yoghurt',
    name: 'Amul Yoghurt',
    category: 'Dairy & Milk-Based',
    subcategory: 'Lassi & Yogurt',
    variants: [{ size: '50g', mrp: 30 }],

    mrp: 30,
    iconName: 'icecream',
    imageUrl: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80',
    description: 'Flavoured fruit yoghurt cup.',
  },

  // ─── ICE CREAM & FROZEN DESSERTS ──────────────────────────────────────────
  {
    id: 'amul-chocobar',
    name: 'Amul Chocobar',
    category: 'Ice Cream & Frozen Desserts',
    subcategory: 'Ice Cream Bars & Cones',
    variants: [{ size: '50g', mrp: 25 }],

    mrp: 25,
    iconName: 'icecream',
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    description: 'Vanilla ice cream bar coated in dark chocolate layer.',
  },
  {
    id: 'cornetto-butterscotch',
    name: "Kwality Wall's Cornetto",
    category: 'Ice Cream & Frozen Desserts',
    subcategory: 'Ice Cream Bars & Cones',
    variants: [{ size: '100g', mrp: 40 }],

    mrp: 40,
    iconName: 'icecream',
    imageUrl: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?auto=format&fit=crop&w=800&q=80',
    description: 'Crispy cone with butterscotch ice cream & chocolate tip.',
  },
  {
    id: 'vanilla-magnum',
    name: 'Vanilla Magnum',
    category: 'Ice Cream & Frozen Desserts',
    subcategory: 'Ice Cream Bars & Cones',
    variants: [{ size: '100g', mrp: 90 }],

    mrp: 90,
    iconName: 'icecream',
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    description: 'Belgian chocolate coated vanilla ice cream bar.',
  },
  {
    id: 'amul-tub-butterscotch',
    name: 'Amul Tub Butterscotch/Chocolate',
    category: 'Ice Cream & Frozen Desserts',
    subcategory: 'Tubs & Packs',
    variants: [{ size: '100g', mrp: 150 }],

    mrp: 150,
    iconName: 'icecream',
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    description: '500ml family ice cream tub.',
  },

  // ─── BREAD, BUNS & BAKERY ──────────────────────────────────────────
  {
    id: 'britannia-bread',
    name: 'Britannia Bread',
    category: 'Bread, Buns & Bakery',
    subcategory: 'Bakery & Breads',
    variants: [{ size: '100g', mrp: 45 }],

    mrp: 45,
    iconName: 'bakery_dining',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Fresh white / brown bread slice loaf.',
  },
  {
    id: 'modern-bread',
    name: 'Modern Bread',
    category: 'Bread, Buns & Bakery',
    subcategory: 'Bakery & Breads',
    variants: [{ size: '100g', mrp: 45 }],

    mrp: 45,
    iconName: 'bakery_dining',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Soft sliced bakery sandwich bread.',
  },
  {
    id: 'britannia-rusk',
    name: 'Britannia Rusk',
    category: 'Bread, Buns & Bakery',
    subcategory: 'Bakery & Breads',
    variants: [{ size: '100g', mrp: 35 }],

    mrp: 35,
    iconName: 'bakery_dining',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Crunchy elaichi toast rusk for tea.',
  },
  {
    id: 'parle-rusk',
    name: 'Parle Rusk',
    category: 'Bread, Buns & Bakery',
    subcategory: 'Bakery & Breads',
    variants: [{ size: '100g', mrp: 35 }],

    mrp: 35,
    iconName: 'bakery_dining',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Crispy real elaichi rusk toast.',
  },
];

/**
 * Helper safety lookup function. Guaranteed never to return undefined.
 */
export const getProductById = (id: string, customProducts: Product[] = []): Product => {
  const combined = [...MOCK_PRODUCTS, ...customProducts];
  const found = combined.find((p) => p.id === id);
  if (found) return found;

  return {
    id: id,
    name: id.replace(/[-_]/g, ' '),
    category: 'Instant Food',
    subcategory: 'Noodles',
    variants: [{ size: '100g', mrp: 50 }],

    mrp: 50,
    iconName: 'shopping_bag',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    description: 'Custom listing',
  };
};

// Helper compatibility exports for legacy mock context
export const decrementListingQuantity = (listingId: string, qty: number = 1) => {};
export const syncUserListingWithProfile = (roomNumber: string, isAwake: boolean, deliveryOptIn: boolean) => {};

// ─── Room Number Parsing ─────────────────────────────────────────────
export interface ParsedRoom {
  block: string;  // e.g. "A", "B", "C"
  floor: number;  // e.g. 1, 2, 3
  roomNum: number; // e.g. 4 for A304
}

export const parseRoomNumber = (roomStr: string): ParsedRoom => {
  if (!roomStr) return { block: '', floor: 0, roomNum: 0 };

  const clean = roomStr.trim().toUpperCase();

  // 1. Try multi-letter block prefix (e.g. NB304, OB102, MAIN201)
  const multiMatch = clean.match(/^([A-Z]{2,4})(\d{1,2})(\d{2})$/);
  if (multiMatch) {
    return {
      block: multiMatch[1],
      floor: parseInt(multiMatch[2], 10),
      roomNum: parseInt(multiMatch[3], 10),
    };
  }

  // 2. Try single-letter block prefix (e.g. A304, B102, C205)
  const singleMatch = clean.match(/^([A-Z])(\d{1,2})(\d{2})$/);
  if (singleMatch) {
    return {
      block: singleMatch[1],
      floor: parseInt(singleMatch[2], 10),
      roomNum: parseInt(singleMatch[3], 10),
    };
  }

  // 3. Fallback generic match
  const alphaMatch = clean.match(/^([A-Z]+)(\d+)/);
  if (alphaMatch) {
    const blk = alphaMatch[1];
    const rest = alphaMatch[2];
    const flr = rest.length >= 3 ? parseInt(rest.slice(0, -2), 10) : parseInt(rest.charAt(0) || '0', 10);
    const rm = rest.length >= 2 ? parseInt(rest.slice(-2), 10) : 0;
    return {
      block: blk,
      floor: isNaN(flr) ? 0 : flr,
      roomNum: isNaN(rm) ? 0 : rm,
    };
  }

  return { block: '', floor: 0, roomNum: 0 };
};

export const splitRoomString = (
  roomStr: string,
  hostelBlocks: string[] = ['A']
): { block: string; number: string } => {
  if (!roomStr) return { block: hostelBlocks[0] || 'A', number: '' };

  const parsed = parseRoomNumber(roomStr);
  if (parsed.block && parsed.floor !== 0) {
    const formattedNum = `${parsed.floor}${parsed.roomNum.toString().padStart(2, '0')}`;
    const matchedBlock = hostelBlocks.includes(parsed.block) ? parsed.block : hostelBlocks[0] || parsed.block;
    return { block: matchedBlock, number: formattedNum };
  }

  const match = roomStr.trim().toUpperCase().match(/^([A-Z]{1,4})(\d+)/);
  if (match) {
    const matchedBlock = hostelBlocks.includes(match[1]) ? match[1] : hostelBlocks[0] || match[1];
    return { block: matchedBlock, number: match[2] };
  }

  return { block: hostelBlocks[0] || 'A', number: roomStr.replace(/\D/g, '') };
};

export const computeFloorDistance = (room1: string, room2: string): number => {
  const user = parseRoomNumber(room1);
  const seller = parseRoomNumber(room2);

  if (!user.block || !seller.block) return 0;

  if (user.block === seller.block) {
    return Math.abs(user.floor - seller.floor);
  }
  return (user.floor - 1) + (seller.floor - 1);
};

export const getProximityLabel = (userRoom: string, sellerRoom: string): string => {
  const user = parseRoomNumber(userRoom);
  const seller = parseRoomNumber(sellerRoom);

  if (!user.block || !seller.block) return 'Same hostel';

  const sameBlock = user.block === seller.block;
  const dist = computeFloorDistance(userRoom, sellerRoom);

  if (sameBlock && dist === 0) return 'Same floor';
  if (sameBlock && dist === 1) return '1 floor away';
  if (sameBlock) return `${dist} floors away`;

  if (dist === 0) return `Block ${seller.block}, same floor`;
  return `Block ${seller.block}, ${dist} ${dist === 1 ? 'floor' : 'floors'} away`;
};

export const sortListingsByProximity = (listings: Listing[], userRoom: string): Listing[] => {
  const userParsed = parseRoomNumber(userRoom);

  return [...listings].sort((a, b) => {
    const aParsed = parseRoomNumber(a.sellerRoom);
    const bParsed = parseRoomNumber(b.sellerRoom);

    const aSameBlock = userParsed.block && aParsed.block === userParsed.block;
    const bSameBlock = userParsed.block && bParsed.block === userParsed.block;

    if (aSameBlock && !bSameBlock) return -1;
    if (!aSameBlock && bSameBlock) return 1;

    const aDist = computeFloorDistance(userRoom, a.sellerRoom);
    const bDist = computeFloorDistance(userRoom, b.sellerRoom);

    if (aDist !== bDist) {
      return aDist - bDist;
    }

    const aRoomDiff = Math.abs(userParsed.roomNum - aParsed.roomNum);
    const bRoomDiff = Math.abs(userParsed.roomNum - bParsed.roomNum);
    return aRoomDiff - bRoomDiff;
  });
};
