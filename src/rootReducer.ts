import authReducer from "./features/auth/authSlice";
import productsReducer from "./features/products/productsSlice";
import categoriesReducer from "./features/categories/categoriesSlice";
import brandsReducer from "./features/brands/brandsSlice";
import typesReducer from "./features/types/typesSlice";
import fabricsReducer from "./features/fabrics/fabricsSlice";
import productLabelsReducer from "./features/productLabels/productLabelsSlice";
import sizesReducer from "./features/sizes/sizesSlice";
import colorsReducer from "./features/colors/colorsSlice";
import discountsReducer from "./features/discounts/discountsSlice";
import couponsReducer from "./features/coupons/couponsSlice";
import ordersReducer from "./features/orders/ordersSlice";
import paymentsReducer from "./features/payments/paymentsSlice";
import usersReducer from "./features/users/usersSlice";
import customerReviewsReducer from "./features/customerReviews/customerReviewsSlice";
import cartsReducer from "./features/carts/cartSlice";
import wishlistsReducer from "./features/wishlists/wishlistSlice";
import contactUsReducer from "./features/contactUs/contactUsSlice";
import navbarReducer from "./features/navbar/navbarSlice";
import footerReducer from "./features/footer/footerSlice";
import profileReducer from "./features/profile/profileSlice";
import settingReducer from "./features/settings/settingsSlice";
import storesReducer from "./features/stores/storeSlice";
import pagesReducer from "./features/pages/pagesSlice";
import dashboardReducer from "./features/dashboard/dashboardSlice";
import warehouseReducer from "./features/warehouse/warehouseSlice";
import subcategoriReducer from "./features/subcategories/subcategoriesSlice";
import faqsReducer from "./features/faqs/faqsSlice";

export const rootReducer = {
  auth: authReducer,
  products: productsReducer,
  warehouse: warehouseReducer,
  categories: categoriesReducer,
  brands: brandsReducer,
  types: typesReducer,
  fabrics: fabricsReducer,
  productLabels: productLabelsReducer,
  sizes: sizesReducer,
  colors: colorsReducer,
  discounts: discountsReducer,
  coupons: couponsReducer,
  orders: ordersReducer,
  payments: paymentsReducer,
  users: usersReducer,
  customerReviews: customerReviewsReducer,
  carts: cartsReducer,
  wishlists: wishlistsReducer,
  contactUs: contactUsReducer,
  pages: pagesReducer,
  navbar: navbarReducer,
  footer: footerReducer,
  profile: profileReducer,
  setting: settingReducer,
  stores: storesReducer,
  dashboard: dashboardReducer,
  subcategori: subcategoriReducer,
  faqs: faqsReducer,
};
