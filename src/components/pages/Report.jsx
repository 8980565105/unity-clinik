import { lazy, Suspense } from "react";
import Row from "../ui/Row";
import Section from "../ui/Section";
import ReportCard from "./Reportcard";
const Customerreviews = lazy(() => import("../home/Customerreviews"));

export default function Report() {
  return (
    <>
      {/* <Section>
        <Row>
          {" "}
          <div>Your Treatment @₹2196</div>
          <div className="flex justify-between">
            <div>product</div>
            <div>1000</div>
          </div>
          <div className="flex justify-between">
            <span>total price</span>
            <span>1000</span>
          </div>
        </Row>
      </Section> */}

      {/* <ReportCard /> */}

      {/* <div className="mb-5">
        {" "}
        <Suspense>
          <Customerreviews />
        </Suspense>
      </div> */}
    </>
  );
}
