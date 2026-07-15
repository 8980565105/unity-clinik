import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import VelzonDashboard from "./pages/VelzonDashboard";
import Products from "./pages/Products/Products";
import AddProduct from "./pages/Products/AddProduct";
import Users from "./pages/Users/Users";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Categories from "./pages/Categories/Categories";
import CategoryFormPage from "./pages/Categories/CategoryForm";
import BrandFormPage from "./pages/Brands/BrandFormPage";
import Brands from "./pages/Brands/Brands";
import TypeFormPage from "./pages/Types/TypeForm";
import Types from "./pages/Types/Types";
import ProductLabels from "./pages/ProductLabels/ProductLabels";
import ProductLabelFormPage from "./pages/ProductLabels/ProductLabelForm";
import CouponFormPage from "./pages/coupons/CouponForm";
import CouponsPage from "./pages/coupons/Coupons";
import Orders from "./pages/Orders/Orders";
import Payments from "./pages/Payments/Payments";
import UserFormPage from "./pages/Users/UserForm";
import CustomerReviews from "./pages/CustomerReviews/CustomerReviews";
import Cart from "./pages/carts/carts";
import Wishlist from "./pages/Wishlists/Wishlist";
import ContactUs from "./pages/ContactUs/ContactUs";
import Navbar from "./pages/Navbar/Navbar";
import NavbarFormPage from "./pages/Navbar/NavbarForm";
import Footer from "./pages/Footer/Footer";
import FooterFormPage from "./pages/Footer/FooterForm";
import Settings from "./pages/Settings/Settings";
import Stores from "./pages/Stores/Store";
import StoreFormPage from "./pages/Stores/StoreForm";
import StoreOwnerFormPage from "./pages/StoreOwner/StoreOwnerForm";
import Pages from "./pages/Pages/Pages";
import PageFormPage from "./pages/Pages/PagesForm";
import Forgatepassword from "./pages/Forgatepassword";
import Subcategories from "./pages/Subcategories/Subcategories"
import SubCategoryFormPage from "./pages/Subcategories/SubcategoryForm";
import ResultFrom from "./pages/Result/ResultFrom";
import Result from "./pages/Result/Result";
import EmailsFormPage from "./pages/Email/EmailFrom";
import CustomerReviewsFrom from "./pages/CustomerReviews/CustomerReviewsFrom";
import EmailsPage from "./pages/Email/Email";
import SliderPage from "./pages/slider/slider";
import SlideFormPage from "./pages/slider/sliderFrom";
import SystemSettings from "./pages/systemseting/systemsetingFrom";
import AboutPageFrom from "./pages/aboutpage/aboutpageform";
import Popup from "./pages/popup/popup";
import PopupFrom from "./pages/popup/poupform";
import BookConsoltantion from "./pages/bookconsaltantions/book";
import ConsultationPageForm from "./pages/bookconsaltantions/consaltantionPageFrom";
import SippingCharge from "./pages/sippingcharge/SippingCharge";
import ReffrelForm from "./pages/ReffrelSetting/reffrelform";
import Userswallet from "./pages/userwallet/userwallet";
import Userviews from "./pages/Users/Userviews";
import UserWalletView from "./pages/userwallet/userwalletview";
import Bookview from "./pages/bookconsaltantions/bookview";
import BookEdit from "./pages/bookconsaltantions/bookedit";

const queryClient = new QueryClient();
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/forgate-password" element={<Forgatepassword />}></Route>
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<VelzonDashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/:id/edit" element={<AddProduct />} />
              <Route path="categories" element={<Categories />} />
              <Route path="categories/add" element={<CategoryFormPage />} />
              <Route path="categories/:id/edit" element={<CategoryFormPage />} />
              <Route path="subcategories" element={<Subcategories />} />
              <Route path="subcategories/add" element={<SubCategoryFormPage />} />
              <Route path="subcategories/:id/edit" element={<SubCategoryFormPage />} />
              <Route path="brands" element={<Brands />} />
              <Route path="brands/add" element={<BrandFormPage />} />
              <Route path="brands/:id/edit" element={<BrandFormPage />} />
              <Route path="types" element={<Types />} />
              <Route path="types/add" element={<TypeFormPage />} />
              <Route path="types/:id/edit" element={<TypeFormPage />} />
              <Route path="product-labels" element={<ProductLabels />} />
              <Route path="product-labels/add" element={<ProductLabelFormPage />} />
              <Route path="product-labels/:id/edit" element={<ProductLabelFormPage />} />
              <Route path="coupons" element={<CouponsPage />} />
              <Route path="coupons/add" element={<CouponFormPage />} />
              <Route path="coupons/:id/edit" element={<CouponFormPage />} />
              <Route path="orders" element={<Orders />} />
              <Route path="payments" element={<Payments />} />
              <Route path="users" element={<Users />} />
              <Route path="users/add" element={<UserFormPage />} />
              <Route path="users/:id/edit" element={<UserFormPage />} />
              <Route path="users/:id/view" element={<Userviews />} />
              <Route path="customer-reviews" element={<CustomerReviews />} />
              <Route path="customer-reviews/add" element={<CustomerReviewsFrom />} />
              <Route path="customer-reviews/:id/edit" element={<CustomerReviewsFrom />} />
              <Route path="wishlists" element={<Wishlist />} />
              <Route path="carts" element={<Cart />} />
              <Route path="about" element={<AboutPageFrom />} />
              <Route path="results" element={<Result />} />
              <Route path="results/add" element={<ResultFrom />} />
              <Route path="results/:id/edit" element={<ResultFrom />} />
              <Route path="emails" element={<EmailsPage />} />
              <Route path="emails/add" element={<EmailsFormPage />} />
              <Route path="emails/:id/edit" element={<EmailsFormPage />} />
              <Route path="pages" element={<Pages />} />
              <Route path="pages/add" element={<PageFormPage />} />
              <Route path="pages/:id/edit" element={<PageFormPage />} />
              <Route path="slider" element={<SliderPage />} />
              <Route path="slider/add" element={<SlideFormPage />} />
              <Route path="slider/:id/edit" element={<SlideFormPage />} />
              <Route path="popup" element={<Popup />} />
              <Route path="popup/add" element={<PopupFrom />} />
              <Route path="popup/:id/edit" element={<PopupFrom />} />
              <Route path="bookConsoltantion" element={<BookConsoltantion />} />
              <Route path="consoltantion" element={<ConsultationPageForm />} />
              <Route path="navbar" element={<Navbar />} />
              <Route path="navbar/add" element={<NavbarFormPage />} />
              <Route path="navbar/:id/edit" element={<NavbarFormPage />} />
              <Route path="footer" element={<Footer />} />
              <Route path="footer/add" element={<FooterFormPage />} />
              <Route path="footer/:id/edit" element={<FooterFormPage />} />
              <Route path="contact-messages" element={<ContactUs />} />
              <Route path="settings" element={<Settings />} />
              <Route path="stores" element={<Stores />} />
              <Route path="stores/add" element={<StoreFormPage />} />
              <Route path="stores/:id/edit" element={<StoreFormPage />} />
              <Route path="store-owners/add" element={<StoreOwnerFormPage />} />
              <Route path="store-owners/:id/edit" element={<StoreOwnerFormPage />} />
              <Route path="system_settings" element={<SystemSettings />} />
              <Route path="reffrel_settings" element={<ReffrelForm />} />
              <Route path="charge" element={<SippingCharge />} />
              <Route path="userwallet" element={<Userswallet />} />
              <Route path="userwallet/:id/view" element={<UserWalletView />} />
              <Route path="bookConsoltantion/:id/view" element={<Bookview />} />
              <Route path="consultation-bookings/:id/edit" element={<BookEdit />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;