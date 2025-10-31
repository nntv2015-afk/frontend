import MetaData from "@/components/Meta/MetaData";
import dynamic from "next/dynamic";

const SearchPage = dynamic(
  () => import("@/components/PagesComponents/SearchPage/SearchPage"),
  { ssr: false }
);

const index = ({ metaTitle, metaDescription }) => {
  return (
    <div>
      <MetaData
        title={metaTitle}
        description={metaDescription}
        keywords={process.env.NEXT_PUBLIC_META_KEYWORDS}
        pageName="/search"
      />
      <SearchPage />
    </div>
  );
};

export async function getServerSideProps(context) {
  const { slug, type } = context.query;
  
  let metaTitle = `Search - ${process.env.NEXT_PUBLIC_META_TITLE}`;
  let metaDescription = process.env.NEXT_PUBLIC_META_DESCRIPTION;
  let searchType = "service";
  let formattedQuery = "";

  if (slug) {
    // Extract search query from slug
    const searchQuery = slug.replace(/-/g, " ");
    searchType = type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : "service";
    
    // Capitalize first letter of each word
    formattedQuery = searchQuery
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    
    // Create dynamic meta title and description
    metaTitle = `Search ${searchType} - ${formattedQuery} | ${process.env.NEXT_PUBLIC_META_TITLE}`;
    metaDescription = `Discover top-rated ${searchType}s for "${formattedQuery}". Find trusted providers, compare services, and book appointments online. Get the best ${searchType}s near you.`;
   
  }

  return {
    props: {
      metaTitle,
      metaDescription,
      searchType,
      formattedQuery,
    },
  };
}

export default index;
