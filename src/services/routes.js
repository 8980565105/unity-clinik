export const ROUTES = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
    logout: "/auth/logout",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  upload: {
    image: "/uploads/image",
  },
  navbar: {
    getAll: "/navbar",
    getPublic: "/navbar/public",
  },
  footer: {
    getAll: "/footer",
    public: "/footer/public",
  },
  products: {
    getPublic: "/products/public",
    getPublicById: (id) => `/products/public/${id}`,
  },
  categories: {
    getAll: "/categories/public",
  },
  subcategories: {
    getAll: "/subcategories/public",
  },
  pages: {
    getAll: "/pages",
    getById: (id) => `/pages/${id}`,
    getBySlug: (slug) => `/pages/get/${slug}`,
    create: "/pages",
    update: (id) => `/pages/${id}`,
    updateStatus: (id) => `/pages/${id}/status`,
    delete: (id) => `/pages/${id}`,
    bulkDelete: "/pages/bulk-delete",
  },
  sizes: {
    getPublic: "/sizes/public",
    getAll: "/sizes",
    getById: (id) => `/sizes/${id}`,
  },
  colors: {
    getPublic: "/colors/public",
    getAll: "/colors",
    getById: (id) => `/colors/${id}`,
  },
  brands: {
    getPublic: "/brands/public",
    getAll: "/brands",
  },
  types: {
    getAll: "/types",
    getPublic: "/types/public",
  },
  fabrics: {
    getAll: "/fabrics",
    getPublic: "/fabrics/public",
  },
  discounts: {
    getAll: "/discounts",
    getPublic: "/discounts/Public",
  },
  productLabels: {
    getPublic: "/product-labels/Public",
    getAll: "/product-labels",
  },
  wishlist: {
    getAll: "/wishlists",
    addItem: "/wishlists/items",
    removeItem: "/wishlists/items",
    getByUser: (id) => `/wishlists/user/${id}`,
    bulkDelete: "/wishlists/bulk-delete",
  },
  cart: {
    getAll: "/carts",
    getById: (id) => `/carts/${id}`,
    addItem: "/carts/add-item",
    updateItem: "/carts/update-item",
    deleteItem: "/carts/delete-item",
  },
  updatecart: {
    getAll: "/carts",
    getById: (id) => `/carts/${id}`,
    addItem: "/carts/items",
    updateItem: "/carts/items",
    deleteCart: "/carts/items",
  },
  orders: {
    getPublic: "/orders/public",
    getAll: "/orders",
    getById: (id) => `/orders/${id}`,
    deleteById: (id) => `/orders/${id}`,
    getUserOrders: (userId) => `/orders?user=${userId}`,
  },
  payments: {
    getAll: "/payments",
    createOrder: "/payments/razorpay-order",
    verify: "/payments/verify",
    verifyPhonePePayment: "/payments/phonepe/verify",
    createPhonePeOrder: "/payments/phonepe/initiate",
  },
  contact: {
    getAll: "/contact-us",
  },
  user: {
    updateOneProfile: "/users/me",
    updateProfile: (id) => `/users/${id}`,
  },
  collections: {
    getAll: "/categories",
  },
  coupons: {
    getAll: "/coupons",
    getPublic: "/coupons/public",
    getById: (id) => `/coupons/${id}`,
  },
  faqs: {
    getPublic: "/faqs/public",
    getAll: "/faqs",
    getById: (id) => `/faqs/${id}`,
    getBanner: "/faqs/banner/public",
  },
  about: {
    get: "/about",
    getPublic: "/about/public",
  },
  store: {
    getinfo: "/stores/info",
  },
  settings: {
    public: "/settings/public",
    get: "/settings",
    update: "/settings",
  },
  customerReviews: {
    post: "/customer-reviews",
    getAll: "/customer-reviews",
    getPublic: "/customer-reviews/public",
  },

  results: {
    getPublic: "/results/public",
  },

  dashboard: {
    get: "/dashboard/count",
  },

  emails: {
    create: "/emails",
  },
  slide: {
    getPublic: "/slider/public",
  },

  SystemSettings: {
    get: "/system-setting/public",
  },
  aboutpage: {
    get: "/aboutpage/public",
  },
};
