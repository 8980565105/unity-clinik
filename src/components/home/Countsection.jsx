import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiShoppingCart, FiUsers } from "react-icons/fi";
import { MdCurrencyRupee } from "react-icons/md";
import { fetchDashboard } from "../../features/dashboard/dashboardThunk";
import Section from "../ui/Section";
import Row from "../ui/Row";

function Countsection() {
  const dispatch = useDispatch();
  const { totalProducts, totalOrders, totalUsers, totalRevenue, loading } =
    useSelector((state) => state.dashboard);

  const StatsData = [
    {
      icon: <FiUsers size={20} className="text-white" />,
      count: totalUsers,
      suffix: "+",
      label: "Total Users",
      color: "bg-orange-500",
    },
    {
      icon: <FiShoppingCart size={20} className="text-white" />,
      count: totalProducts,
      suffix: "+",
      label: "Total Products",
      color: "bg-yellow-500",
    },
    {
      icon: <FiShoppingCart size={20} className="text-white" />,
      count: totalOrders,
      suffix: "+",
      label: "Total Orders",
      color: "bg-blue-500",
    },
    {
      icon: <MdCurrencyRupee className="text-white" />,
      count: totalRevenue,
      suffix: "+",
      label: "Revenue",
      color: "bg-emerald-500",
    },
  ];

  const [counts, setCounts] = useState(StatsData.map(() => 0));
  const [startAnimation, setStartAnimation] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  useEffect(() => {
    setCounts(StatsData.map(() => 0));
    setStartAnimation(false);
  }, [totalProducts, totalOrders, totalUsers, totalRevenue]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartAnimation(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!startAnimation) return;

    const intervals = StatsData.map((stat, index) => {
      let current = 0;
      const end = stat.count;

      const step = Math.ceil(end / 10);

      return setInterval(() => {
        current += step;

        if (current >= end) {
          current = end;
        }

        setCounts((prev) => {
          const updated = [...prev];
          updated[index] = current;
          return updated;
        });

        if (current >= end) clearInterval(intervals[index]);
      }, 80);
    });

    return () => intervals.forEach(clearInterval);
  }, [startAnimation]);
  return (
    <div ref={sectionRef}>
      <Section className="bg-[#053946] py-20 px-6 font-sans">
        <div className="relative flex items-center justify-center mb-[20px] md:mb-[30px]">
          <div className="w-[18px] md:w-[50px] border-t border-white"></div>
          <h2 className="font-h2 text-white whitespace-nowrap relative z-10 mx-5">
            Why Choose Us
          </h2>
          <div className="w-[18px] md:w-[50px] border-t border-white"></div>
        </div>
        <Row>
          <p className="text-white text-sm leading-relaxed max-w-2xl mx-auto mb-20">
            We design, create, and execute quick and agile strategies that
            reflect your business operations seamlessly to offer robust business
            growth.
          </p>
        </Row>

        <div className="max-w-7xl mx-auto">
          {loading ? (
            <p className="text-white text-center">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {StatsData.map((stat, index) => (
                <div
                  key={index}
                  className="flex gap-[15px] items-center justify-center  bg-white group hover:-translate-y-2 transition-all"
                  style={{
                    borderRadius: "40px 100px 40px 110px",
                    paddingTop: "20px",
                    paddingLeft: "24px",
                    paddingRight: "20px",
                    paddingBottom: "20px",
                    height: "250px",
                    width: "100%",
                  }}
                >
                  <div
                    className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {stat.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-[40px] text-black font-bold mb-1">
                      {counts[index]}
                      {stat.suffix}
                    </p>
                    <p className="text-black font-medium">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

export default Countsection;
