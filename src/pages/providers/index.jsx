import MetaData from '@/components/Meta/MetaData'
import { fetchSeoSettings } from '@/utils/Helper';
import dynamic from 'next/dynamic'

const AllProvidersPage = dynamic(
  () => import('@/components/PagesComponents/AllProviders/AllProvidersPage'),
  { ssr: false })

let serverSidePropsFunction = null;

if (process.env.NEXT_PUBLIC_ENABLE_SEO === "true") {
  serverSidePropsFunction = async () => {
    try {
      const seoData = await fetchSeoSettings("providers-page");
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
}) => {
  const pageUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/providers`;
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
      <AllProvidersPage />
    </>
  )
}

export default index