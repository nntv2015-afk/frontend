import MetaData from "@/components/Meta/MetaData";
import { fetchSeoSettings } from "@/utils/Helper";
import dynamic from "next/dynamic";

const ProviderDetailsPage = dynamic(
  () =>
    import(
      "@/components/PagesComponents/ProviderDetailsPage/ProviderDetailsPage"
    ),
  { ssr: false }
);

let serverSidePropsFunction = null;

if (process.env.NEXT_PUBLIC_ENABLE_SEO === "true") {
  serverSidePropsFunction = async (context) => {
    const { slug } = context.params;

    const page = slug?.length > 1 ? "service-details" : "provider-details";

    const finalSlug = slug?.length > 1 ? slug[1] : slug[0];
    try {
      const seoData = await fetchSeoSettings(page, finalSlug);
      return seoData;
    } catch (error) {
      console.error("Error fetching SEO data:", error);
    }
  };
}

export const getServerSideProps = serverSidePropsFunction;

const index = ({
  title,
  description,
  keywords,
  ogImage,
  schemaMarkup,
  favicon,
  ogTitle,
  ogDescription,
  twitterTitle,
  twitterDescription,
  twitterImage,
  slug,
}) => {
  const pageUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/provider-details/${slug}`;
  return (

    <>
     <MetaData
        // Basic SEO
        title={title}
        description={description}
        keywords={keywords}
        pageName="/about-us"
        // Open Graph
        ogTitle={ogTitle}
        ogDescription={ogDescription}
        ogImage={ogImage}
        ogUrl={pageUrl}
        // Twitter
        twitterTitle={twitterTitle}
        twitterDescription={twitterDescription}
        twitterImage={twitterImage}
        // Additional
        structuredData={schemaMarkup}
        canonicalUrl={pageUrl}
        favicon={favicon}
      />
      <ProviderDetailsPage />
    </>
  );
};

export default index;
