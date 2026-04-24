import { Link, useNavigate } from "react-router-dom";
import SEO from "../components/seo/seo";
import errorImg from "../assets/404.png";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import Button from "../components/ui/Button";

export default function NotFound() {
  const Navigate = useNavigate();
  return (
    <>
      <SEO title="404 - Page Not Found" description="Page not found" />

      <Section>
        <Row>
          <div className="flex justify-center">
            <img
              src={errorImg}
              alt="404"
              className="max-w-[320px] md:max-w-[420px] w-full object-contain"
            />
          </div>
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-[42px] md:text-5xl font-serif font-bold text-black mb-4">
              Oooops!
            </h1>

            <p className="text-gray-600 text-sm md:text-base mb-6 max-w-md leading-relaxed">
              Seems like we've lost our way in the medical maze. Stay tuned as
              we navigate back to the right path.
            </p>

            <Button variant="common" onClick={() => Navigate("/")}>
              Go To Home Page
            </Button>
          </div>
        </Row>
      </Section>
    </>
  );
}
