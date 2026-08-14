import { Product, Listing, ProductAggregate, ProductCategory } from '../types/catalog';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Instant Food',
  'Chips & Namkeen',
  'Biscuits & Cookies',
  'Chocolates & Sweets',
  'Cold Drinks & Juices',
  'Energy Drinks',
  'Dairy & Milk-based',
  'Ice Cream & Desserts',
];

export const MOCK_PRODUCTS: Product[] = [
  // ─── INSTANT FOOD ──────────────────────────────────────────
  {
    id: 'maggi',
    name: 'Maggi 2-Min Noodles',
    category: 'Instant Food',
    mrp: 14,
    iconName: 'ramen_dining',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBS8GbLxU4aPaAV9aMMhovsvP36DZYvoIs2GbUMsDPMkihA-ii6hfSkciOuu9Z-RBPTV6RlK32tcIBFy1rwOQWmNF_5T8IJ5UFhaBy-1UTfvebKxbs5zWG_KQE77qMNybxJEzn0BFZuh0q16a2eQTWLOyfi52XMn7ghhewc-RiAW4lrBWr101cwAMrDoFEQ8hDZIkV4yWzb5VT_sDq78ktIZMsieEblv7EOV8QxTQJSbu1rviFkWwmY',
    description: '2-Minute Masala Noodles. The ultimate late-night study fuel.',
  },
  {
    id: 'cup-noodles',
    name: 'Nissin Cup Noodles',
    category: 'Instant Food',
    mrp: 50,
    iconName: 'soup_kitchen',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBS8GbLxU4aPaAV9aMMhovsvP36DZYvoIs2GbUMsDPMkihA-ii6hfSkciOuu9Z-RBPTV6RlK32tcIBFy1rwOQWmNF_5T8IJ5UFhaBy-1UTfvebKxbs5zWG_KQE77qMNybxJEzn0BFZuh0q16a2eQTWLOyfi52XMn7ghhewc-RiAW4lrBWr101cwAMrDoFEQ8hDZIkV4yWzb5VT_sDq78ktIZMsieEblv7EOV8QxTQJSbu1rviFkWwmY',
    description: 'Instant Spicy Garlic Seafood/Veg Cup Noodles.',
  },
  {
    id: 'yippee',
    name: 'Yippee Magic Masala',
    category: 'Instant Food',
    mrp: 15,
    iconName: 'ramen_dining',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBS8GbLxU4aPaAV9aMMhovsvP36DZYvoIs2GbUMsDPMkihA-ii6hfSkciOuu9Z-RBPTV6RlK32tcIBFy1rwOQWmNF_5T8IJ5UFhaBy-1UTfvebKxbs5zWG_KQE77qMNybxJEzn0BFZuh0q16a2eQTWLOyfi52XMn7ghhewc-RiAW4lrBWr101cwAMrDoFEQ8hDZIkV4yWzb5VT_sDq78ktIZMsieEblv7EOV8QxTQJSbu1rviFkWwmY',
    description: 'Sunfeast Yippee long non-sticky noodles.',
  },
  {
    id: 'oats',
    name: 'Saffola Masala Oats',
    category: 'Instant Food',
    mrp: 30,
    iconName: 'set_meal',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBwKxRdou5JLdGAjXoO8zD80swKlAevmZ7a-cr5H09y5AID9fvhdylaXNE8TiGDPMLNZbP2t1FwQgqP0bAPJ_mFaD9JUUcLTix_52apmAjv6QnU5BN15B4uhLMF8INHyCK-5AnGo5HkibaTvJ-j_5Dckiehqy7x7tMe0eMihXVr_42hh5tZWaWdD1zQOWTuGy5B8lc3NhtpIJ0R9IO1CV6M_dao_Iemm-B1yp8igL9hchc14bMFQ6eJ',
    description: 'Saffola Masala Oats instant savory pouch.',
  },

  // ─── CHIPS & NAMKEEN ──────────────────────────────────────────
  {
    id: 'lays-chips',
    name: 'Lays Chips (India)',
    category: 'Chips & Namkeen',
    mrp: 20,
    iconName: 'lunch_dining',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDn0Wr9mwbp7VRiU5Ca6Ppx4KynoT4dgL19YZConvPUx4EFcRnbQmZFaerHw00mevTGict6VqWEHyDIhhtEOu_4eIdEQQ7XIFNxg3bF7opL6vD6hJzkjMSllHq-tfNuuTlD_15XSh_695HPnKHzIzOjfGQuNAx723FA08tf3bQJITHY-I3e56SXfAV37412rSO_O7yTcT8UYfeSdPnu2bhzecAKslwCb8P1sZUn2wK1FScAspaGycK8',
    description: 'Magic Masala & Classic Salted potato chips.',
  },
  {
    id: 'kurkure',
    name: 'Kurkure Masala Munch',
    category: 'Chips & Namkeen',
    mrp: 20,
    iconName: 'local_fire_department',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDbIwvG8waF6ql68810MiFA3ZsgaTypSd5psfXN6qfgegN0p6uLuTVDO_EM-rRo5TkvcD1FTyRN8hg_jAuODADC2TvJahww9noX2JU_seMri2yWqozFB52iyDgtdSlZD65ztsbP0xLrJxy9-w3ytc4YqogMxLgrgRsB-0ErMBbnq5czQLeQXioL1Zt41qD-nnzkJfRZOuHx8kSTCePlH_BxPyfNeLafFRTqqDO9rbC2aQ7hU_3ZH7QA',
    description: 'Tedhe Medhe crunchy Masala Munch puffs.',
  },
  {
    id: 'bingo-mad-angles',
    name: 'Bingo Mad Angles',
    category: 'Chips & Namkeen',
    mrp: 20,
    iconName: 'category',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDn0Wr9mwbp7VRiU5Ca6Ppx4KynoT4dgL19YZConvPUx4EFcRnbQmZFaerHw00mevTGict6VqWEHyDIhhtEOu_4eIdEQQ7XIFNxg3bF7opL6vD6hJzkjMSllHq-tfNuuTlD_15XSh_695HPnKHzIzOjfGQuNAx723FA08tf3bQJITHY-I3e56SXfAV37412rSO_O7yTcT8UYfeSdPnu2bhzecAKslwCb8P1sZUn2wK1FScAspaGycK8',
    description: 'Achaari Masti crunchy triangle corn chips.',
  },
  {
    id: 'haldirams-bhujia',
    name: 'Haldirams Aloo Bhujia',
    category: 'Chips & Namkeen',
    mrp: 35,
    iconName: 'grain',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDbIwvG8waF6ql68810MiFA3ZsgaTypSd5psfXN6qfgegN0p6uLuTVDO_EM-rRo5TkvcD1FTyRN8hg_jAuODADC2TvJahww9noX2JU_seMri2yWqozFB52iyDgtdSlZD65ztsbP0xLrJxy9-w3ytc4YqogMxLgrgRsB-0ErMBbnq5czQLeQXioL1Zt41qD-nnzkJfRZOuHx8kSTCePlH_BxPyfNeLafFRTqqDO9rbC2aQ7hU_3ZH7QA',
    description: 'Spicy classic Haldiram Aloo Bhujia namkeen.',
  },
  {
    id: 'doritos',
    name: 'Doritos Nacho Cheese',
    category: 'Chips & Namkeen',
    mrp: 30,
    iconName: 'details',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDn0Wr9mwbp7VRiU5Ca6Ppx4KynoT4dgL19YZConvPUx4EFcRnbQmZFaerHw00mevTGict6VqWEHyDIhhtEOu_4eIdEQQ7XIFNxg3bF7opL6vD6hJzkjMSllHq-tfNuuTlD_15XSh_695HPnKHzIzOjfGQuNAx723FA08tf3bQJITHY-I3e56SXfAV37412rSO_O7yTcT8UYfeSdPnu2bhzecAKslwCb8P1sZUn2wK1FScAspaGycK8',
    description: 'Bold cheesy tortilla corn chips.',
  },

  // ─── BISCUITS & COOKIES ──────────────────────────────────────────
  {
    id: 'parle-g',
    name: 'Parle-G Biscuits',
    category: 'Biscuits & Cookies',
    mrp: 10,
    iconName: 'cookie',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDn0Wr9mwbp7VRiU5Ca6Ppx4KynoT4dgL19YZConvPUx4EFcRnbQmZFaerHw00mevTGict6VqWEHyDIhhtEOu_4eIdEQQ7XIFNxg3bF7opL6vD6hJzkjMSllHq-tfNuuTlD_15XSh_695HPnKHzIzOjfGQuNAx723FA08tf3bQJITHY-I3e56SXfAV37412rSO_O7yTcT8UYfeSdPnu2bhzecAKslwCb8P1sZUn2wK1FScAspaGycK8',
    description: 'Original iconic Glucose biscuits for chai time.',
  },
  {
    id: 'bourbon',
    name: 'Britannia Bourbon',
    category: 'Biscuits & Cookies',
    mrp: 25,
    iconName: 'cookie',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDn0Wr9mwbp7VRiU5Ca6Ppx4KynoT4dgL19YZConvPUx4EFcRnbQmZFaerHw00mevTGict6VqWEHyDIhhtEOu_4eIdEQQ7XIFNxg3bF7opL6vD6hJzkjMSllHq-tfNuuTlD_15XSh_695HPnKHzIzOjfGQuNAx723FA08tf3bQJITHY-I3e56SXfAV37412rSO_O7yTcT8UYfeSdPnu2bhzecAKslwCb8P1sZUn2wK1FScAspaGycK8',
    description: 'Rich chocolate cream biscuits with sugar crystals.',
  },
  {
    id: 'oreo',
    name: 'Oreo Original',
    category: 'Biscuits & Cookies',
    mrp: 30,
    iconName: 'cookie',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDn0Wr9mwbp7VRiU5Ca6Ppx4KynoT4dgL19YZConvPUx4EFcRnbQmZFaerHw00mevTGict6VqWEHyDIhhtEOu_4eIdEQQ7XIFNxg3bF7opL6vD6hJzkjMSllHq-tfNuuTlD_15XSh_695HPnKHzIzOjfGQuNAx723FA08tf3bQJITHY-I3e56SXfAV37412rSO_O7yTcT8UYfeSdPnu2bhzecAKslwCb8P1sZUn2wK1FScAspaGycK8',
    description: 'Chocolate Sandwich Cookies with Vanilla Cream.',
  },
  {
    id: 'dark-fantasy',
    name: 'Dark Fantasy Choco Fills',
    category: 'Biscuits & Cookies',
    mrp: 40,
    iconName: 'cookie',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDn0Wr9mwbp7VRiU5Ca6Ppx4KynoT4dgL19YZConvPUx4EFcRnbQmZFaerHw00mevTGict6VqWEHyDIhhtEOu_4eIdEQQ7XIFNxg3bF7opL6vD6hJzkjMSllHq-tfNuuTlD_15XSh_695HPnKHzIzOjfGQuNAx723FA08tf3bQJITHY-I3e56SXfAV37412rSO_O7yTcT8UYfeSdPnu2bhzecAKslwCb8P1sZUn2wK1FScAspaGycK8',
    description: 'Sunfeast Dark Fantasy cookies filled with molten chocolate.',
  },

  // ─── CHOCOLATES & SWEETS ──────────────────────────────────────────
  {
    id: 'dairy-milk-silk',
    name: 'Cadbury Dairy Milk Silk',
    category: 'Chocolates & Sweets',
    mrp: 80,
    iconName: 'cake',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDn0Wr9mwbp7VRiU5Ca6Ppx4KynoT4dgL19YZConvPUx4EFcRnbQmZFaerHw00mevTGict6VqWEHyDIhhtEOu_4eIdEQQ7XIFNxg3bF7opL6vD6hJzkjMSllHq-tfNuuTlD_15XSh_695HPnKHzIzOjfGQuNAx723FA08tf3bQJITHY-I3e56SXfAV37412rSO_O7yTcT8UYfeSdPnu2bhzecAKslwCb8P1sZUn2wK1FScAspaGycK8',
    description: 'Ultra smooth and creamy milk chocolate bar.',
  },
  {
    id: 'kitkat',
    name: 'KitKat 4-Finger',
    category: 'Chocolates & Sweets',
    mrp: 30,
    iconName: 'cake',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDn0Wr9mwbp7VRiU5Ca6Ppx4KynoT4dgL19YZConvPUx4EFcRnbQmZFaerHw00mevTGict6VqWEHyDIhhtEOu_4eIdEQQ7XIFNxg3bF7opL6vD6hJzkjMSllHq-tfNuuTlD_15XSh_695HPnKHzIzOjfGQuNAx723FA08tf3bQJITHY-I3e56SXfAV37412rSO_O7yTcT8UYfeSdPnu2bhzecAKslwCb8P1sZUn2wK1FScAspaGycK8',
    description: 'Crispy wafer fingers covered in smooth milk chocolate.',
  },
  {
    id: 'snickers',
    name: 'Snickers Peanut Bar',
    category: 'Chocolates & Sweets',
    mrp: 40,
    iconName: 'cake',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDn0Wr9mwbp7VRiU5Ca6Ppx4KynoT4dgL19YZConvPUx4EFcRnbQmZFaerHw00mevTGict6VqWEHyDIhhtEOu_4eIdEQQ7XIFNxg3bF7opL6vD6hJzkjMSllHq-tfNuuTlD_15XSh_695HPnKHzIzOjfGQuNAx723FA08tf3bQJITHY-I3e56SXfAV37412rSO_O7yTcT8UYfeSdPnu2bhzecAKslwCb8P1sZUn2wK1FScAspaGycK8',
    description: 'Hunger busting roasted peanut, caramel and nougat bar.',
  },
  {
    id: 'five-star',
    name: 'Cadbury 5 Star',
    category: 'Chocolates & Sweets',
    mrp: 20,
    iconName: 'cake',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDn0Wr9mwbp7VRiU5Ca6Ppx4KynoT4dgL19YZConvPUx4EFcRnbQmZFaerHw00mevTGict6VqWEHyDIhhtEOu_4eIdEQQ7XIFNxg3bF7opL6vD6hJzkjMSllHq-tfNuuTlD_15XSh_695HPnKHzIzOjfGQuNAx723FA08tf3bQJITHY-I3e56SXfAV37412rSO_O7yTcT8UYfeSdPnu2bhzecAKslwCb8P1sZUn2wK1FScAspaGycK8',
    description: 'Chewy caramel and nougat chocolate bar.',
  },

  // ─── COLD DRINKS & JUICES ──────────────────────────────────────────
  {
    id: 'coca-cola',
    name: 'Coca Cola Can',
    category: 'Cold Drinks & Juices',
    mrp: 40,
    iconName: 'local_drink',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBhrtnySZmxlnJdN6JAsXgXrERxLTkUFaLuAbQb4Bvoal7EXwBar3rpDqyhHGHO1ja2-fSurn7cE95SsOG8X0mFNRXFYTnzYgYd3XvXFb8JlNKT-hxXywDLocxPXCqwwZKqKaWpaEmK6ggrd78QPDcO2KHrNqy0QW1iOcSnZjVin410f5Rmt5zEHNrHuaLNDUKbVmp3g3DIk0MyzZ-EvwerAt_rorUiUIzqIP9hqCKTkEalzr9RQ1_G',
    description: 'Ice cold 250ml Coca Cola carbonated drink.',
  },
  {
    id: 'thums-up',
    name: 'Thums Up Charged',
    category: 'Cold Drinks & Juices',
    mrp: 40,
    iconName: 'local_drink',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBhrtnySZmxlnJdN6JAsXgXrERxLTkUFaLuAbQb4Bvoal7EXwBar3rpDqyhHGHO1ja2-fSurn7cE95SsOG8X0mFNRXFYTnzYgYd3XvXFb8JlNKT-hxXywDLocxPXCqwwZKqKaWpaEmK6ggrd78QPDcO2KHrNqy0QW1iOcSnZjVin410f5Rmt5zEHNrHuaLNDUKbVmp3g3DIk0MyzZ-EvwerAt_rorUiUIzqIP9hqCKTkEalzr9RQ1_G',
    description: 'Strong fizzy cola with taste of thunder.',
  },
  {
    id: 'frooti',
    name: 'Parle Frooti Mango',
    category: 'Cold Drinks & Juices',
    mrp: 20,
    iconName: 'local_drink',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBhrtnySZmxlnJdN6JAsXgXrERxLTkUFaLuAbQb4Bvoal7EXwBar3rpDqyhHGHO1ja2-fSurn7cE95SsOG8X0mFNRXFYTnzYgYd3XvXFb8JlNKT-hxXywDLocxPXCqwwZKqKaWpaEmK6ggrd78QPDcO2KHrNqy0QW1iOcSnZjVin410f5Rmt5zEHNrHuaLNDUKbVmp3g3DIk0MyzZ-EvwerAt_rorUiUIzqIP9hqCKTkEalzr9RQ1_G',
    description: 'Fresh Mango juice drink pack.',
  },

  // ─── ENERGY DRINKS ──────────────────────────────────────────
  {
    id: 'red-bull',
    name: 'Red Bull Energy Drink',
    category: 'Energy Drinks',
    mrp: 125,
    iconName: 'bolt',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBhrtnySZmxlnJdN6JAsXgXrERxLTkUFaLuAbQb4Bvoal7EXwBar3rpDqyhHGHO1ja2-fSurn7cE95SsOG8X0mFNRXFYTnzYgYd3XvXFb8JlNKT-hxXywDLocxPXCqwwZKqKaWpaEmK6ggrd78QPDcO2KHrNqy0QW1iOcSnZjVin410f5Rmt5zEHNrHuaLNDUKbVmp3g3DIk0MyzZ-EvwerAt_rorUiUIzqIP9hqCKTkEalzr9RQ1_G',
    description: '250ml Energy Drink. Vitalizes body & mind for late night coding.',
  },
  {
    id: 'sting',
    name: 'Sting Energy Drink',
    category: 'Energy Drinks',
    mrp: 20,
    iconName: 'bolt',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBhrtnySZmxlnJdN6JAsXgXrERxLTkUFaLuAbQb4Bvoal7EXwBar3rpDqyhHGHO1ja2-fSurn7cE95SsOG8X0mFNRXFYTnzYgYd3XvXFb8JlNKT-hxXywDLocxPXCqwwZKqKaWpaEmK6ggrd78QPDcO2KHrNqy0QW1iOcSnZjVin410f5Rmt5zEHNrHuaLNDUKbVmp3g3DIk0MyzZ-EvwerAt_rorUiUIzqIP9hqCKTkEalzr9RQ1_G',
    description: 'High energy berry flavoured carbonated beverage.',
  },

  // ─── DAIRY & MILK-BASED ──────────────────────────────────────────
  {
    id: 'amul-chocolate-milk',
    name: 'Amul Kool Chocolate Milk',
    category: 'Dairy & Milk-based',
    mrp: 30,
    iconName: 'water_drop',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBhrtnySZmxlnJdN6JAsXgXrERxLTkUFaLuAbQb4Bvoal7EXwBar3rpDqyhHGHO1ja2-fSurn7cE95SsOG8X0mFNRXFYTnzYgYd3XvXFb8JlNKT-hxXywDLocxPXCqwwZKqKaWpaEmK6ggrd78QPDcO2KHrNqy0QW1iOcSnZjVin410f5Rmt5zEHNrHuaLNDUKbVmp3g3DIk0MyzZ-EvwerAt_rorUiUIzqIP9hqCKTkEalzr9RQ1_G',
    description: 'Delicious chilled Amul Kool Koko chocolate drink.',
  },
  {
    id: 'amul-lassi',
    name: 'Amul Rose Lassi',
    category: 'Dairy & Milk-based',
    mrp: 20,
    iconName: 'water_drop',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBhrtnySZmxlnJdN6JAsXgXrERxLTkUFaLuAbQb4Bvoal7EXwBar3rpDqyhHGHO1ja2-fSurn7cE95SsOG8X0mFNRXFYTnzYgYd3XvXFb8JlNKT-hxXywDLocxPXCqwwZKqKaWpaEmK6ggrd78QPDcO2KHrNqy0QW1iOcSnZjVin410f5Rmt5zEHNrHuaLNDUKbVmp3g3DIk0MyzZ-EvwerAt_rorUiUIzqIP9hqCKTkEalzr9RQ1_G',
    description: 'Sweet refreshing Rose Lassi pouch.',
  },

  // ─── ICE CREAM & DESSERTS ──────────────────────────────────────────
  {
    id: 'amul-chocobar',
    name: 'Amul Chocobar Ice Cream',
    category: 'Ice Cream & Desserts',
    mrp: 25,
    iconName: 'icecream',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDn0Wr9mwbp7VRiU5Ca6Ppx4KynoT4dgL19YZConvPUx4EFcRnbQmZFaerHw00mevTGict6VqWEHyDIhhtEOu_4eIdEQQ7XIFNxg3bF7opL6vD6hJzkjMSllHq-tfNuuTlD_15XSh_695HPnKHzIzOjfGQuNAx723FA08tf3bQJITHY-I3e56SXfAV37412rSO_O7yTcT8UYfeSdPnu2bhzecAKslwCb8P1sZUn2wK1FScAspaGycK8',
    description: 'Vanilla ice cream bar coated in dark chocolate layer.',
  },
  {
    id: 'cornetto-butterscotch',
    name: 'Kwality Walls Cornetto',
    category: 'Ice Cream & Desserts',
    mrp: 40,
    iconName: 'icecream',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDn0Wr9mwbp7VRiU5Ca6Ppx4KynoT4dgL19YZConvPUx4EFcRnbQmZFaerHw00mevTGict6VqWEHyDIhhtEOu_4eIdEQQ7XIFNxg3bF7opL6vD6hJzkjMSllHq-tfNuuTlD_15XSh_695HPnKHzIzOjfGQuNAx723FA08tf3bQJITHY-I3e56SXfAV37412rSO_O7yTcT8UYfeSdPnu2bhzecAKslwCb8P1sZUn2wK1FScAspaGycK8',
    description: 'Crispy cone with butterscotch ice cream & chocolate tip.',
  },
];

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
  const match = clean.match(/^([A-Z])(\d{1,2})(\d{2})$/);
  if (match) {
    return {
      block: match[1],
      floor: parseInt(match[2], 10),
      roomNum: parseInt(match[3], 10),
    };
  }

  const fallbackBlock = clean.charAt(0);
  const restNums = clean.slice(1).replace(/\D/g, '');
  const floor = restNums.length >= 3 ? parseInt(restNums.slice(0, -2), 10) : parseInt(restNums.charAt(0) || '0', 10);
  const roomNum = restNums.length >= 2 ? parseInt(restNums.slice(-2), 10) : 0;

  return {
    block: /[A-Z]/.test(fallbackBlock) ? fallbackBlock : '',
    floor: isNaN(floor) ? 0 : floor,
    roomNum: isNaN(roomNum) ? 0 : roomNum,
  };
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
