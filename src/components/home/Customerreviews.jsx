import React, { useEffect, useState } from "react";
import Section from "../ui/Section";
import Row from "../ui/Row";
import ReviewCard from "../reviews/reviewscard";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllReviews } from "../../features/reivews/reviewsThunk";
import NavBtn from "../ui/Navbtn";
import Heading from "../ui/Heading";
const CARD_WIDTH = 320;
const GAP = 48;
const VISIBLE = 4;
const STEP = CARD_WIDTH + GAP;
export default function Customerreviews() {
  const dispatch = useDispatch();
  const { allReviews = [], loading } = useSelector((state) => state.reviews);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    dispatch(fetchAllReviews({ page: 1, limit: 12 }));
  }, [dispatch]);

  const maxOffset = Math.max(0, allReviews.length - VISIBLE);

  const prev = () => setOffset((o) => Math.max(0, o - 1));
  const next = () => setOffset((o) => Math.min(maxOffset, o + 1));

  return (
    <Section className="bg-[var(--ef3a96-9)]">
      <Row>
        <Heading title={"What Our Customer Says!"} />

        {/* Slider */}
        <div className="relative flex items-center">
          {offset > 0 && <NavBtn direction="left" onClick={prev} />}

          <div
            className="overflow-hidden mx-auto"
            style={{ width: `${VISIBLE * CARD_WIDTH + (VISIBLE - 1) * GAP}px` }}
          >
            <div
              className="flex gap-8 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${offset * STEP}px)` }}
            >
              {loading ? (
                <p className="p-4">Loading...</p>
              ) : allReviews.length > 0 ? (
                allReviews.map((review, i) => (
                  <div key={review._id} className="flex-shrink-0">
                    <ReviewCard review={review} index={i} />
                  </div>
                ))
              ) : (
                <p className="p-4">No reviews found</p>
              )}
            </div>
          </div>

          {offset < maxOffset && <NavBtn direction="right" onClick={next} />}
        </div>
      </Row>
    </Section>
  );
}
