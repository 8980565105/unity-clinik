import Row from "../ui/Row";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaShoppingBag, FaUser } from "react-icons/fa";
import Orders from "./Orders";
import Dashboard from "./Dashbord";
import Section from "../ui/Section";
import { LogOut, MapPin } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { clearCart } from "../../features/cart/cartSlice";
import Address from "../Address/Address";
import AccountDetails from "../AccountDetails/AccountDetails";

const tabs = [
  {
    name: "Dashboard",
    path: "/my-account/dashboard",
    icon: <FaTachometerAlt />,
    component: Dashboard,
  },
  {
    name: "Orders",
    path: "/my-account/orders",
    icon: <FaShoppingBag />,
    component: Orders,
  },
  {
    name: "Account Details",
    path: "/my-account/account-details",
    icon: <FaUser />,
    component: AccountDetails,
  },
  {
    name: "Log out",
    path: "/my-account/logout",
    icon: <LogOut />,
    component: null,
    isLogout: true,
  },
];

export default function AccountTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeTab =
    tabs.find((tab) => tab.path === location.pathname) || tabs[0];
  const ActiveComponent = activeTab.component;
  const handleLogout = (e) => {
    e.preventDefault();

    dispatch(logout());
    dispatch(clearCart());
    navigate("/Home", { replace: true });
  };
  return (
    <Section className="!pt-0 -mt-[43px]">
      <Row className="!max-w-[1122px]">
        <div className="flex gap-[10px] flex-wrap">
          {tabs.map((tab) => {
            if (tab.isLogout) {
              return (
                <button
                  key={tab.name}
                  onClick={handleLogout}
                  className="flex items-center h-[43px] gap-[10px] px-[15px] sm:px-[30px] py-2 transition text-[18px] 
                    bg-[rgba(255,255,255,0.50)] text-primary "
                >
                  <span>{tab.icon}</span>
                  <span className="hidden custom-lg:inline">{tab.name}</span>
                </button>
              );
            }
            return (
              <NavLink
                key={tab.name}
                to={tab.path}
                className={({ isActive }) =>
                  `flex items-center h-[43px] gap-[10px] px-[15px] sm:px-[30px] py-2 transition text-[18px]
                  ${
                    isActive
                      ? "bg-white font-medium text-primary"
                      : "bg-[rgba(255,255,255,0.50)] text-primary "
                  }`
                }
              >
                <span>{tab.icon}</span>
                <span className="hidden custom-lg:inline">{tab.name}</span>
              </NavLink>
            );
          })}
        </div>
      </Row>
      <Row className="!max-w-[1122px] mt-[34px]">
        {ActiveComponent ? (
          <ActiveComponent />
        ) : (
          <p>{activeTab.path} content goes here.</p>
        )}
      </Row>
    </Section>
  );
}
