import MetaData from "@/components/Meta/MetaData";
import dynamic from "next/dynamic";
import { fetchSeoSettings } from "@/utils/Helper";

const HomePage = dynamic(() => import("@/components/HomePage/HomePage"), {
  ssr: false,
});

let serverSidePropsFunction = null;

if (process.env.NEXT_PUBLIC_ENABLE_SEO === "true") {
  serverSidePropsFunction = async () => {
    try {
      const seoData = await fetchSeoSettings("home");
      return seoData;
    } catch (error) {
      console.error("Error fetching SEO data:", error);
    }
  };
}

export const getServerSideProps = serverSidePropsFunction;

export default function Home({
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
}) {
  const pageUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/`;

  return (
    <>
      <MetaData
        // Basic SEO
        title={title}
        description={description}
        keywords={keywords}
        pageName="/"
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
      <HomePage />
    </>
  );
} 