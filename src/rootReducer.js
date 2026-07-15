import authReducer from "./features/auth/authSlice";
import userReducer from "./features/user/userSlice";
import navbarReducer from "./features/navbar/navbarSlice";
import footerReducer from "./features/footer/footerSlice";
import productsReducer from "./features/products/productsSlice";
import discountsReducer from "./features/discounts/discountsSlice";
import couponsReducer from "./features/coupons/couponsSlice";
import categoriesReducer from "./features/categories/categoriesSlice";
import subcategoriesReducer from "./features/subcategories/subcategoriesSlice";
import pagesReducer from "./features/pages/pagesSlice";
import brandsReducer from "./features/brands/brandsSlice";
import typesReducer from "./features/types/typesSlice";
import productLabelsReducer from "./features/productLabels/productLabelsSlice";
import wishlistReducer from "./features/wishlist/wishlistSlice";
import cartReducer from "./features/cart/cartSlice";
import orderReducer from "./features/orders/orderSlice";
import paymentReducer from "./features/payments/paymentSlice";
import contactReducer from "./features/contact/contactSlice";
import reviewsReducer from "./features/reivews/reviewsSlice";
import addressReducer from "./features/address/addressSlice";
import faqsReducer from "./features/faqs/faqsSlice";
import storeReducer from "./features/store/storeSlice";
import settingReducer from "./features/setting/settingSlice";
import resultReducer from "./features/results/resultsSlice";
import dashboardReducer from "./features/dashboard/dashboardSlice";
import emailsReducer from "./features/emails/emailSlice";
import slideReducer from "./features/slides/slideSlice";
import SystemSettingsReducer from "./features/systemsetting/systemsettingSlice";
import aboutReducer from "./features/about/aboutSlice";
import popupReducer from "./features/popup/popupSlice";
import consultationPageReducer from "./features/consaltantion/consaltantionSlice";
import sippingchargeReducer from "./features/sippingcharge/sippingchargeSlice";
import walletReducer from "./features/wallet/walletSlice";
import reffrelReducer from "./features/reffrel/reffrelSlice";



export const rootReducer = {
  auth: authReducer,
  user: userReducer,
  navbar: navbarReducer,
  footer: footerReducer,
  contact: contactReducer,
  products: productsReducer,
  discounts: discountsReducer,
  categories: categoriesReducer,
  subcategories: subcategoriesReducer,
  coupons: couponsReducer,
  pages: pagesReducer,
  brands: brandsReducer,
  types: typesReducer,
  productLabels: productLabelsReducer,
  wishlist: wishlistReducer,
  cart: cartReducer,
  orders: orderReducer,
  payments: paymentReducer,
  reviews: reviewsReducer,
  address: addressReducer,
  faqs: faqsReducer,
  store: storeReducer,
  settings: settingReducer,
  results: resultReducer,
  dashboard: dashboardReducer,
  emails: emailsReducer,
  slides: slideReducer,
  systemseting: SystemSettingsReducer,
  about: aboutReducer,
  popup: popupReducer,
  consultationPage: consultationPageReducer,
  sippingcharge: sippingchargeReducer,
  wallet: walletReducer,
  reffrel: reffrelReducer,
};
