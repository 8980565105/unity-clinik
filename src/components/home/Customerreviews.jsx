import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  Suspense,
  lazy,
} from "react";
import Section from "../ui/Section";
import Row from "../ui/Row";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllReviews } from "../../features/reivews/reviewsThunk";
import NavBtn from "../ui/Navbtn";
import Heading from "../ui/Heading";
import Loding from "../loding/loding";

const ReviewCard = lazy(() => import("../reviews/reviewscard"));

export default function Customerreviews() {
  const dispatch = useDispatch();
  const { allReviews = [], loading } = useSelector((state) => state.reviews);

  const getVisible = () => {
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const [visible, setVisible] = useState(getVisible());

  const CARD_W = visible === 1 ? 280 : visible === 2 ? 320 : 425;
  const GAP = visible === 1 ? 20 : visible === 2 ? 30 : 55;
  const STEP = CARD_W + GAP;

  const total = allReviews.length;
  const trackRef = useRef(null);
  const isAnimating = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(total);
  const [isCenter, setIsCenter] = useState(false);

  const tripled =
    total > 0 ? [...allReviews, ...allReviews, ...allReviews] : [];

  useEffect(() => {
    dispatch(fetchAllReviews());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setVisible(getVisible());
      setIsCenter(total <= getVisible());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [total]);

  useEffect(() => {
    setIsCenter(total <= visible);
  }, [total, visible]);

  useEffect(() => {
    setCurrentIndex(total);
  }, [total]);

  useEffect(() => {
    if (trackRef.current && total > 0) {
      trackRef.current.style.transition = "none";
      trackRef.current.style.transform = `translateX(-${total * STEP}px)`;
    }
  }, [total, STEP]);

  const slideTo = (newIndex, withAnimation = true) => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = withAnimation
      ? "transform 300ms cubic-bezier(0.4,0,0.2,1)"
      : "none";
    trackRef.current.style.transform = `translateX(-${newIndex * STEP}px)`;
  };

  const handleNext = () => {
    if (isAnimating.current || total === 0 || isCenter) return;
    isAnimating.current = true;

    const next = currentIndex + 1;
    setCurrentIndex(next);
    slideTo(next, true);

    setTimeout(() => {
      if (next >= total * 2) {
        const reset = next - total;
        setCurrentIndex(reset);
        slideTo(reset, false);
      }
      isAnimating.current = false;
    }, 310);
  };

  const handlePrev = () => {
    if (isAnimating.current || total === 0 || isCenter) return;
    isAnimating.current = true;

    const prev = currentIndex - 1;
    setCurrentIndex(prev);
    slideTo(prev, true);

    setTimeout(() => {
      if (prev < total) {
        const reset = prev + total;
        setCurrentIndex(reset);
        slideTo(reset, false);
      }
      isAnimating.current = false;
    }, 310);
  };

  return (
    <Section className="bg-[var(--ef3a96-9)] py-20">
      <Row>
        <Heading title={"What Our Customer Says!"} />

        {!isCenter && (
          <div className="flex items-center justify-end gap-3 mb-4">
            <NavBtn direction="left" onClick={handlePrev} variant="primary" />
            <NavBtn direction="right" onClick={handleNext} variant="primary" />
          </div>
        )}

        <div className="overflow-hidden w-full">
          <div
            ref={trackRef}
            className={`flex pt-10 ${isCenter ? "justify-center" : "justify-start"}`}
            style={{
              gap: `${GAP}px`,
              transform: isCenter ? "none" : `translateX(-${total * STEP}px)`,
              willChange: "transform",
            }}
          >
            {loading ? (
              <p className="text-white">Loading...</p>
            ) : (
              (isCenter ? allReviews : tripled).map((review, i) => (
                <div
                  key={`${review._id}-${i}`}
                  className="flex-shrink-0"
                  style={{ width: `${CARD_W}px` }}
                >
                  <Suspense fallback={<Loding />}>
                    <ReviewCard review={review} index={i} />
                  </Suspense>
                </div>
              ))
            )}
          </div>
        </div>
      </Row>
    </Section>
  );
}
