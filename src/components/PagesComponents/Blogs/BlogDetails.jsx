import { getBlogDetailsApi } from '@/api/apiRoutes';
import Layout from '@/components/Layout/Layout';
import { useTranslation } from '@/components/Layout/TranslationContext';
import BlogRelatedCard from '@/components/ReUseableComponents/Blog/BlogRelatedCard';
import BlogTagsCard from '@/components/ReUseableComponents/Blog/BlogTagsCard';
import BreadCrumb from '@/components/ReUseableComponents/BreadCrumb';
import CustomImageTag from '@/components/ReUseableComponents/CustomImageTag';
import NoDataFound from '@/components/ReUseableComponents/Error/NoDataFound';
import RichTextContent from '@/components/ReUseableComponents/RichTextContent';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/utils/Helper';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FiFolder } from 'react-icons/fi';
import { MdOutlineCalendarMonth } from 'react-icons/md';

const BlogDetails = () => {
    const t = useTranslation();
    const router = useRouter();
    const { slug } = router.query;
    const [blogDetails, setBlogDetails] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchBlogDetails = async () => {
        setIsLoading(true);
        try {
            const response = await getBlogDetailsApi({ slug });
            if (response?.error === false && response?.data?.blog) {
                setBlogDetails(response?.data?.blog);
                if (response?.data?.related_blogs?.length > 0) {
                    setRelatedBlogs(response?.data?.related_blogs);
                }
            }
        } catch (error) {
            console.log(error);
            setBlogDetails(null);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (slug) {
            fetchBlogDetails();
        }
    }, [slug]);

    return (
        <Layout>
            <BreadCrumb
                firstEle={t("blogs")}
                firstEleLink="/blogs"
                secEle={t("blogDetails")}
                SecEleLink={`/blog-details/${slug}`}
            />
            <section className="container mx-auto py-8">

                {/* Loading State */}
                {isLoading && (
                    <div className="w-full h-[60vh] space-y-4">
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                        <Skeleton className="h-[300px] w-full rounded-xl" />
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                )}

                {/* Grid Layout */}
                {blogDetails ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Content (9 columns) */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            {/* Page Header */}
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold">
                                    {blogDetails?.title}
                                </h1>
                            </div>
                            <div className="relative w-full overflow-hidden rounded-xl aspect-[16/9]">
                                <CustomImageTag
                                    src={blogDetails?.image}
                                    alt={blogDetails?.title}
                                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                {/* Category */}
                                {blogDetails?.category_name && (
                                    <div className='flex items-center gap-2'>
                                        <FiFolder size={24} className='primary_text_color pr-1 min-w-6 min-h-6' />
                                        <Link href={`/blogs?category=${blogDetails?.category_slug}`} title={blogDetails?.category_name}>
                                            <span className="px-2 py-1 rounded-md text-sm hover:primary_text_color transition-all duration-300" title={blogDetails?.category_name}>
                                                {blogDetails?.category_name}
                                            </span>
                                        </Link>
                                    </div>
                                )}
                                {/* Date */}
                                {blogDetails?.created_at && (
                                    <div className='flex items-center gap-2'>
                                        <MdOutlineCalendarMonth size={24} className='primary_text_color pr-1 min-w-6 min-h-6' />

                                        <span className="text-sm description_color">
                                            {formatDate(new Date(blogDetails?.created_at))}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <RichTextContent content={blogDetails?.description} />
                        </div>

                        {/* Sidebar (3 columns) */}
                        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-40">
                            {relatedBlogs?.length > 0 && (
                                <BlogRelatedCard recentPosts={relatedBlogs} />
                            )}
                            {blogDetails?.tags?.length > 0 && (
                                <BlogTagsCard tags={blogDetails?.tags} />
                            )}
                        </div>
                    </div>
                ) : (
                    !isLoading && (
                        <div className="w-full h-[60vh] flex items-center justify-center">
                            <NoDataFound
                                title={t("noBlogFound")}
                                desc={t("noBlogFoundText")}
                            />
                        </div>
                    )
                )}
            </section>
        </Layout>
    );
};

export default BlogDetails;
