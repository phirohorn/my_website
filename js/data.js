/* ==========================================================================
   UNIFORMHUB — Data layer (localStorage-backed "database")
   ========================================================================== */

const DB_KEYS = {
  products: 'uh_products',
  categories: 'uh_categories',
  users: 'uh_users',
  session: 'uh_session',
  cart: 'uh_cart',
  wishlist: 'uh_wishlist',
  orders: 'uh_orders',
  customOrders: 'uh_custom_orders',
  lang: 'uh_lang',
  currency: 'uh_currency',
  seeded: 'uh_seeded_v3'
};

const CATEGORIES = [
  { id: 'school', name_en: 'School Uniform', name_km: 'ឯកសណ្ឋានសាលារៀន', icon: '🎒' },
  { id: 'university', name_en: 'University Uniform', name_km: 'ឯកសណ្ឋានសាកលវិទ្យាល័យ', icon: '🎓' },
  { id: 'office', name_en: 'Office Uniform', name_km: 'ឯកសណ្ឋានការិយាល័យ', icon: '💼' },
  { id: 'corporate', name_en: 'Corporate Uniform', name_km: 'ឯកសណ្ឋានក្រុមហ៊ុន', icon: '🏢' },
  { id: 'custom', name_en: 'Custom Uniform', name_km: 'ឯកសណ្ឋានតាមបំណង', icon: '✂️' }
];

const CURRENCY_RATE = 4100; // 1 USD = 4100 KHR

function seedProducts() {
  const G = 'images/uniformgirl/';
  const B = 'images/uniofrmboy/';
  return [
    {
      id: 'p1', category: 'school',
      name_en: 'Girls School Blouse & Skirt Set', name_km: 'សំលៀកបំពាក់សិស្សស្រី (អាវ+សំពត់)',
      desc_en: 'Classic girls school uniform set with a soft-collar blouse and pleated skirt. Breathable cotton-blend fabric, colorfast stitching, built for daily wear.',
      desc_km: 'ឈុតឯកសណ្ឋានសិស្សស្រីបែបបុរាណ មានអាវក caller ទន់ និងសំពត់ pleated។ ក្រណាត់កប្បាសល្មម ស្រួលដកដង្ហើម ធន់នឹងការប្រើប្រាស់ប្រចាំថ្ងៃ។',
      price: 18.5, oldPrice: 22, stock: 42, material_en: 'Cotton-Polyester Blend', material_km: 'កប្បាស និងប៉ូលីស្តែរ',
      sizes: ['S', 'M', 'L', 'XL'], colors: [{ n: 'White', hex: '#ffffff' }, { n: 'Navy', hex: '#1e3057' }],
      images: [G + '1.jpg', G + '2.jpg'], isNew: true, isFeatured: true, rating: 4.8, reviews: 126, gender: 'Girls'
    },
    {
      id: 'p2', category: 'school',
      name_en: 'Boys School Shirt & Trouser Set', name_km: 'សំលៀកបំពាក់សិស្សប្រុស (អាវ+ខោ)',
      desc_en: 'Durable boys uniform set — crisp button shirt and tailored trousers designed for comfort during long school days.',
      desc_km: 'ឈុតឯកសណ្ឋានសិស្សប្រុសធន់ធាប់ — អាវប៊ូតុងរឹងមាំ និងខោមានទំហំសមរម្យ ស្រួលពាក់ពេញមួយថ្ងៃសិក្សា។',
      price: 17, stock: 55, material_en: 'Polyester-Cotton Blend', material_km: 'ប៉ូលីស្តែរ និងកប្បាស',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: [{ n: 'White', hex: '#ffffff' }, { n: 'Sky Blue', hex: '#8fc7ea' }],
      images: [B + '1.jpg', B + '2.jpg'], isNew: false, isFeatured: true, rating: 4.6, reviews: 98, gender: 'Boys'
    },
    {
      id: 'p3', category: 'university',
      name_en: 'Women University Blazer Set', name_km: 'ឈុតឈុតធំសិស្សស្រីសាកលវិទ្យាល័យ',
      desc_en: 'Smart-fit blazer with matching skirt for university students and faculty. A polished, professional silhouette for campus life.',
      desc_km: 'អាវធំសមទំហំជាមួយសំពត់សម្រាប់សិស្សានុសិស្ស និងសាស្ត្រាចារ្យ។ រូបរាងស្អាតសមរម្យសម្រាប់ជីវិតសាកលវិទ្យាល័យ។',
      price: 34, oldPrice: 40, stock: 20, material_en: 'Wool-Blend Twill', material_km: 'អុសក្រណាត់ Twill',
      sizes: ['S', 'M', 'L', 'XL'], colors: [{ n: 'Navy', hex: '#1e3057' }, { n: 'Charcoal', hex: '#3a3f4b' }],
      images: [G + '2.jpg', G + '3.jpg'], isNew: true, isFeatured: true, rating: 4.9, reviews: 71, gender: 'Women'
    },
    {
      id: 'p4', category: 'university',
      name_en: 'Men University Blazer Set', name_km: 'ឈុតធំសិស្សប្រុសសាកលវិទ្យាល័យ',
      desc_en: 'Structured blazer and trouser combo for male students, tailored for a confident academic look.',
      desc_km: 'ឈុតអាវធំ និងខោសម្រាប់សិស្សប្រុស រចនាឡើងសម្រាប់រូបរាងសិក្សាដ៏ទំនុកចិត្ត។',
      price: 36, stock: 5, material_en: 'Wool-Blend Twill', material_km: 'អុសក្រណាត់ Twill',
      sizes: ['M', 'L', 'XL', 'XXL'], colors: [{ n: 'Navy', hex: '#1e3057' }, { n: 'Black', hex: '#16233d' }],
      images: [B + '2.jpg', B + '3.jpg'], isNew: false, isFeatured: false, rating: 4.5, reviews: 40, gender: 'Men'
    },
    {
      id: 'p5', category: 'office',
      name_en: 'Women Office Formal Set', name_km: 'ឈុតការិយាល័យផ្លូវការសិស្រី',
      desc_en: 'Elegant formal set for the modern office woman — tailored blouse and trousers in wrinkle-resistant fabric.',
      desc_km: 'ឈុតការិយាល័យទំនើប — អាវ និងខោមានទំហំសមរម្យ ធន់នឹងស្នាមជ្រួញ។',
      price: 42, stock: 30, material_en: 'Poly-Viscose', material_km: 'ប៉ូលី-វីស្កូស',
      sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: [{ n: 'Black', hex: '#16233d' }, { n: 'Beige', hex: '#d8cbb0' }],
      images: [G + '3.jpg', G + '1.jpg'], isNew: false, isFeatured: true, rating: 4.7, reviews: 87, gender: 'Women'
    },
    {
      id: 'p6', category: 'office',
      name_en: 'Men Office Formal Set', name_km: 'ឈុតការិយាល័យផ្លូវការសិស្រុប',
      desc_en: 'Professional shirt and trouser set built for all-day comfort at the office with a clean, sharp fit.',
      desc_km: 'ឈុតអាវ និងខោវិជ្ជាជីវៈ ស្រួលពាក់ពេញមួយថ្ងៃធ្វើការ ជាមួយរូបរាងសមរម្យ។',
      price: 39, stock: 0, material_en: 'Poly-Viscose', material_km: 'ប៉ូលី-វីស្កូស',
      sizes: ['M', 'L', 'XL'], colors: [{ n: 'Grey', hex: '#8890a6' }, { n: 'Navy', hex: '#1e3057' }],
      images: [B + '3.jpg', B + '1.jpg'], isNew: false, isFeatured: false, rating: 4.4, reviews: 33, gender: 'Men'
    },
    {
      id: 'p7', category: 'corporate',
      name_en: 'Women Corporate Executive Set', name_km: 'ឈុតប្រតិបត្តិក្រុមហ៊ុនស្រី',
      desc_en: 'Premium corporate uniform designed for brand consistency and executive-level presentation.',
      desc_km: 'ឈុតឯកសណ្ឋានក្រុមហ៊ុនកម្រិតខ្ពស់ រចនាឡើងសម្រាប់ភាពស្របគ្នារបស់ម៉ាក និងរូបរាងជាអ្នកគ្រប់គ្រង។',
      price: 55, oldPrice: 65, stock: 15, material_en: 'Premium Blend Suiting', material_km: 'ក្រណាត់ Suiting កម្រិតខ្ពស់',
      sizes: ['S', 'M', 'L', 'XL'], colors: [{ n: 'Charcoal', hex: '#3a3f4b' }, { n: 'Wine', hex: '#7a2436' }],
      images: [G + '4.png', G + '5.png'], isNew: true, isFeatured: true, rating: 5.0, reviews: 52, gender: 'Women'
    },
    {
      id: 'p8', category: 'corporate',
      name_en: 'Men Corporate Executive Set', name_km: 'ឈុតប្រតិបត្តិក្រុមហ៊ុនប្រុស',
      desc_en: 'Sharp corporate suiting set for men — built for brand identity across retail and hospitality teams.',
      desc_km: 'ឈុត Suiting ក្រុមហ៊ុនសម្រាប់បុរស — សម្រាប់អត្តសញ្ញាណម៉ាកលើក្រុមលក់រាយ និងសេវាកម្ម។',
      price: 58, stock: 8, material_en: 'Premium Blend Suiting', material_km: 'ក្រណាត់ Suiting កម្រិតខ្ពស់',
      sizes: ['M', 'L', 'XL', 'XXL'], colors: [{ n: 'Charcoal', hex: '#3a3f4b' }, { n: 'Black', hex: '#16233d' }],
      images: [B + '4.jpg', B + '5.jpg'], isNew: false, isFeatured: true, rating: 4.8, reviews: 61, gender: 'Men'
    },
    {
      id: 'p9', category: 'school',
      name_en: 'Girls PE / Sports Uniform', name_km: 'ឯកសណ្ឋានកីឡាសិស្សស្រី',
      desc_en: 'Lightweight, breathable sports uniform for physical education classes and school sports days.',
      desc_km: 'ឯកសណ្ឋានកីឡាស្រាល ស្រួលដកដង្ហើម សម្រាប់ថ្នាក់អប់រំកាយ និងកម្មវិធីកីឡាសាលា។',
      price: 15, stock: 60, material_en: 'Polyester Mesh', material_km: 'ក្រណាត់ Polyester Mesh',
      sizes: ['S', 'M', 'L', 'XL'], colors: [{ n: 'Red', hex: '#e5484d' }, { n: 'Navy', hex: '#1e3057' }],
      images: [G + '5.png', G + '4.png'], isNew: true, isFeatured: false, rating: 4.6, reviews: 44, gender: 'Girls'
    },
    {
      id: 'p10', category: 'school',
      name_en: 'Boys PE / Sports Uniform', name_km: 'ឯកសណ្ឋានកីឡាសិស្សប្រុស',
      desc_en: 'Durable sportswear set for boys with moisture-wicking fabric, ideal for active school days.',
      desc_km: 'ឈុតកីឡាធន់ធាប់សម្រាប់ក្មេងប្រុស ក្រណាត់ស្រូបទឹករមួល សមស្របសម្រាប់សកម្មភាពសាលា។',
      price: 15, stock: 3, material_en: 'Polyester Mesh', material_km: 'ក្រណាត់ Polyester Mesh',
      sizes: ['S', 'M', 'L', 'XL'], colors: [{ n: 'Blue', hex: '#2f5fd8' }, { n: 'Black', hex: '#16233d' }],
      images: [B + '5.jpg', B + '4.jpg'], isNew: false, isFeatured: false, rating: 4.5, reviews: 29, gender: 'Boys'
    },
    {
      id: 'p11', category: 'custom',
      name_en: 'Custom Uniform — Logo Embroidery Sample', name_km: 'ឯកសណ្ឋានតាមបំណង — គំរូផាក់ស្លាកយីហោ',
      desc_en: 'Base uniform template ready for your school or company logo, embroidery, and color customization. Submit your design via our Custom Uniform request form.',
      desc_km: 'គំរូឯកសណ្ឋានមូលដ្ឋានដែលអាចដាក់ស្លាកសញ្ញារបស់សាលា ឬក្រុមហ៊ុនអ្នក។ ដាក់ស្នើរចនាបទរបស់អ្នកតាមរយៈទម្រង់ស្នើសុំឯកសណ្ឋានតាមបំណង។',
      price: 25, stock: 99, material_en: 'Customizable Cotton Blend', material_km: 'កប្បាសកែច្នៃតាមបំណង',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: [{ n: 'White', hex: '#ffffff' }, { n: 'Navy', hex: '#1e3057' }, { n: 'Custom', hex: '#e0a92e' }],
      images: [G + '1.jpg', B + '1.jpg'], isNew: true, isFeatured: false, rating: 4.9, reviews: 18, gender: 'Unisex'
    },
    {
      id: 'p12', category: 'custom',
      name_en: 'Custom Uniform — Corporate Bulk Order', name_km: 'ឯកសណ្ឋានតាមបំណង — បញ្ជាទិញចំនួនច្រើនសម្រាប់ក្រុមហ៊ុន',
      desc_en: 'Bulk-order-ready base template for corporate teams needing 20+ matching custom uniforms with brand colors.',
      desc_km: 'គំរូមូលដ្ឋានសម្រាប់ក្រុមហ៊ុនដែលត្រូវការឯកសណ្ឋានតាមបំណងលើសពី ២០ ឈុត ដែលមានពណ៌ត្រូវនឹងម៉ាករបស់អ្នក។',
      price: 28, stock: 99, material_en: 'Customizable Poly-Cotton', material_km: 'ប៉ូលី-កប្បាសកែច្នៃតាមបំណង',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: [{ n: 'Black', hex: '#16233d' }, { n: 'Grey', hex: '#8890a6' }, { n: 'Custom', hex: '#e0a92e' }],
      images: [B + '3.jpg', G + '3.jpg'], isNew: false, isFeatured: false, rating: 4.7, reviews: 12, gender: 'Unisex'
    }
  ];
}

const Store = {
  _get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  },
  _set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },

  init() {
    if (!localStorage.getItem(DB_KEYS.seeded)) {
      this._set(DB_KEYS.products, seedProducts());
      this._set(DB_KEYS.categories, CATEGORIES);
      this._set(DB_KEYS.users, [
        { id: 'u_admin', name: 'Administrator', email: 'admin@uniformhub.com', password: 'admin123', role: 'admin', phone: '', address: '' },
        { id: 'u_demo', name: 'Demo Customer', email: 'demo@uniformhub.com', password: 'demo123', role: 'customer', phone: '012 345 678', address: 'Phnom Penh, Cambodia' }
      ]);
      this._set(DB_KEYS.orders, []);
      this._set(DB_KEYS.customOrders, []);
      this._set(DB_KEYS.cart, []);
      this._set(DB_KEYS.wishlist, []);
      localStorage.setItem(DB_KEYS.seeded, '1');
    }
    if (!localStorage.getItem(DB_KEYS.lang)) localStorage.setItem(DB_KEYS.lang, 'en');
    if (!localStorage.getItem(DB_KEYS.currency)) localStorage.setItem(DB_KEYS.currency, 'USD');
  },

  getProducts() { return this._get(DB_KEYS.products, []); },
  saveProducts(list) { this._set(DB_KEYS.products, list); },
  getProduct(id) { return this.getProducts().find(p => p.id === id); },

  getCategories() { return this._get(DB_KEYS.categories, CATEGORIES); },
  saveCategories(list) { this._set(DB_KEYS.categories, list); },

  getUsers() { return this._get(DB_KEYS.users, []); },
  saveUsers(list) { this._set(DB_KEYS.users, list); },

  getSession() { return this._get(DB_KEYS.session, null); },
  setSession(sess) { this._set(DB_KEYS.session, sess); },
  clearSession() { localStorage.removeItem(DB_KEYS.session); },

  getCart() { return this._get(DB_KEYS.cart, []); },
  saveCart(list) { this._set(DB_KEYS.cart, list); },

  getWishlist() { return this._get(DB_KEYS.wishlist, []); },
  saveWishlist(list) { this._set(DB_KEYS.wishlist, list); },

  getOrders() { return this._get(DB_KEYS.orders, []); },
  saveOrders(list) { this._set(DB_KEYS.orders, list); },

  getCustomOrders() { return this._get(DB_KEYS.customOrders, []); },
  saveCustomOrders(list) { this._set(DB_KEYS.customOrders, list); },

  getLang() { return localStorage.getItem(DB_KEYS.lang) || 'en'; },
  setLang(l) { localStorage.setItem(DB_KEYS.lang, l); },

  getCurrency() { return localStorage.getItem(DB_KEYS.currency) || 'USD'; },
  setCurrency(c) { localStorage.setItem(DB_KEYS.currency, c); }
};

Store.init();

function fmtPrice(usd) {
  const cur = Store.getCurrency();
  if (cur === 'KHR') {
    const khr = Math.round(usd * CURRENCY_RATE / 100) * 100;
    return '៛' + khr.toLocaleString('en-US');
  }
  return '$' + usd.toFixed(2);
}

function genId(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
