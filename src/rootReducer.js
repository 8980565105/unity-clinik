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
import sizesReducer from "./features/sizes/sizesSlice";
import colorsReducer from "./features/colors/colorsSlice";
import brandsReducer from "./features/brands/brandsSlice";
import typesReducer from "./features/types/typesSlice";
import fabricsReducer from "./features/fabrics/fabricsSlice";
import productLabelsReducer from "./features/productLabels/productLabelsSlice";
import wishlistReducer from "./features/wishlist/wishlistSlice";
import cartReducer from "./features/cart/cartSlice";
import orderReducer from "./features/orders/orderSlice";
import paymentReducer from "./features/payments/paymentSlice";
import contactReducer from "./features/contact/contactSlice";
import reviewsReducer from "./features/reivews/reviewsSlice";
import addressReducer from "./features/address/addressSlice";
import offersReducer from "./features/offers/offersSlice";
import faqsReducer from "./features/faqs/faqsSlice";
import storeReducer from "./features/store/storeSlice";
import settingReducer from "./features/setting/settingSlice";

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
  sizes: sizesReducer,
  colors: colorsReducer,
  brands: brandsReducer,
  types: typesReducer,
  fabrics: fabricsReducer,
  productLabels: productLabelsReducer,
  wishlist: wishlistReducer,
  cart: cartReducer,
  orders: orderReducer,
  payments: paymentReducer,
  reviews: reviewsReducer,
  address: addressReducer,
  offers: offersReducer,
  faqs: faqsReducer,
  store: storeReducer,
  settings: settingReducer,
};
