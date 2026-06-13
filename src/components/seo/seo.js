import { Helmet } from "react-helmet-async";

const SEO = ({ title, description, image }) => {
  const brand = "Unity Clinic";

  return (
    <Helmet>
      <title>{title ? ` ${brand} |  ${title}` : brand}</title>
      <meta name="description" content={description} data-rh="true" />
      <meta property="og:title" content={title || brand} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}

      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || brand} />
      <meta name="twitter:description" content={description || ""} />

      {image && <meta name="twitter:image" content={image} />}
      
    </Helmet>
  );
};

export default SEO;
