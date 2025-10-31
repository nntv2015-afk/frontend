"use client"
import BlogPostCard from '@/components/Cards/BlogPostCard';
import Layout from '@/components/Layout/Layout'
import { useTranslation } from '@/components/Layout/TranslationContext';
import BlogCategoriesCard from '@/components/ReUseableComponents/Blog/BlogCategoriesCard';
import BlogTagsCard from '@/components/ReUseableComponents/Blog/BlogTagsCard';
import BreadCrumb from '@/components/ReUseableComponents/BreadCrumb'
import NoDataFound from '@/components/ReUseableComponents/Error/NoDataFound';
import MiniLoader from '@/components/ReUseableComponents/MiniLoader';
import { Skeleton } from '@/components/ui/skeleton';
import { getBlogCategoriesApi, getBlogTagsApi, getBlogsApi } from '@/api/apiRoutes';
import { useRouter } from 'next/router';
import React, { useState, useMemo, useEffect } from 'react'

// Blog Post Skeleton Component
const BlogPostSkeleton = () => {
    return (
        <div className="card_bg rounded-xl shadow-sm overflow-hidden border">
            {/* Image skeleton */}
            <div className="relative h-48 w-full overflow-hidden rounded-t-xl p-4">
                <Skeleton className="h-full w-full rounded-xl" />
            </div>
            
            {/* Content skeleton */}
            <div className="p-4">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    );
};

const BlogsPage = () => {
    const t = useTranslation();
    const router = useRouter();
    const { category, tag } = router.query;

    const [blogs, setBlogs] = useState([]);
    const [blogCategories, setBlogCategories] = useState([]);
    const [blogTags, setBlogTags] = useState([]);
    const [totalBlogs, setTotalBlogs] = useState(0); // Add total count state

    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [tagsLoading, setTagsLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const limit = 6;
    const [isloadMore, setIsloadMore] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    const fetchBlogs = async () => {
       try {
        setLoading(true);
        const response = await getBlogsApi({
            limit: limit,
            offset: offset,
            category: category,
            tag: tag
        });
            if (response?.error === false) {
                // Set total count from API response
                setTotalBlogs(response?.total || 0);
                
                if (Array.isArray(response?.data)) {
                    // If loading more, append new data to existing blogs
                    if (offset > 0) {
                        setBlogs(prevBlogs => [...prevBlogs, ...response.data]);
                    } else {
                        // If initial load or filter change, replace blogs
                        setBlogs(response.data);
                    }
                } else {
                    // If response.data is not an array, maintain current blogs for load more
                    setBlogs(offset > 0 ? prevBlogs => prevBlogs : []);
                }
            }
       } catch (error) {
        console.log(error);
        setBlogs(offset > 0 ? prevBlogs => prevBlogs : []);
       } finally {
        setLoading(false);
        setIsloadMore(false); // Reset load more state
       }
    }

    const fetchBlogCategories = async () => {
        try {
            setCategoriesLoading(true);
            const response = await getBlogCategoriesApi();
            if (response?.error === false && Array.isArray(response?.data)) {
                // Transform data to include count as blog_count
                const categoriesWithCount = response.data.map(category => ({
                    ...category,
                    count: category.blog_count || 0
                }));
                setBlogCategories(categoriesWithCount);
            } else {
                setBlogCategories([]);
            }
        } catch (error) {
            console.log(error);
            setBlogCategories([]);
        } finally {
            setCategoriesLoading(false);
        }
    }

    const fetchBlogTags = async () => {
        try {
            setTagsLoading(true);
            const response = await getBlogTagsApi();
            if (response?.error === false && response?.data?.tags && Array.isArray(response?.data?.tags)) {
                setBlogTags(response?.data?.tags);
            } else {
                setBlogTags([]);
            }
        } catch (error) {
            console.log(error);
            setBlogTags([]);
        } finally {
            setTagsLoading(false);
        }
    }

    // Initial data fetch
    useEffect(() => {
        fetchBlogCategories();
        fetchBlogTags();
    }, []);

    // Fetch blogs when filters change
    useEffect(() => {
        fetchBlogs();
    }, [category, tag, offset]);

    const handleLoadMore = () => {
        setIsloadMore(true);
        const newOffset = offset + limit;
        setOffset(newOffset);
        // Load more will be handled by the useEffect that watches offset
    };

    // Handle filter changes
    const handleFilterChange = () => {
        setIsFiltering(true);
        setOffset(0); // Reset pagination when filters change
        setBlogs([]); // Clear existing blogs
        
        // Simulate loading delay
        setTimeout(() => {
            setIsFiltering(false);
        }, 500);
    };

    // Calculate total count for categories
    const totalBlogCount = useMemo(() => {
        return blogCategories.reduce((sum, category) => sum + (category.count || 0), 0);
    }, [blogCategories]);

    // Determine what to display based on loading and filtering states
    const renderBlogPosts = () => {
        if (loading || isFiltering) {
            // Show skeletons while loading or filtering
            return Array.from({ length: 6 }).map((_, index) => (
                <BlogPostSkeleton key={index} />
            ));
        }
        
        // If no blogs found
        if (!blogs.length) {
            return (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 w-full h-[60vh] flex items-center justify-center">
                    <NoDataFound
                        title={t("noBlogsFoundText")}
                        desc={t("noBlogsFoundDescription")}
                    />
                </div>
            );
        }
        
        // Show blogs
        return blogs.map((post) => (
            <BlogPostCard key={post?.id} post={post} />
        ));
    };

    // Determine if there are more blogs to load
    const hasMoreBlogs = blogs.length < totalBlogs;

    return (
        <Layout>
            <BreadCrumb firstEle={t("blogs")} firstEleLink="/blogs" />

            <section className="container mx-auto">
                {/* Page Header */}
                <div className="">
                    <h1 className="text-3xl font-bold">{t("blogs")}</h1>
                </div>

                {/* Main Grid Layout - Dynamic columns based on sidebar content */}
                <div className="grid grid-cols-12 gap-4 lg:gap-8 py-4 lg:py-8">
                    {/* Main Content - Dynamic columns */}
                    <div className={`col-span-12 ${(blogCategories.length > 0 || blogTags.length > 0) ? 'lg:col-span-9' : ''}`}>
                        {/* Blog Posts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {renderBlogPosts()}
                        </div>

                        {/* Load More Button */}
                        <div className="loadmore my-6 flex items-center justify-center">
                            {isloadMore ? (
                                <button className="primary_bg_color primary_text_color py-3 px-8 rounded-xl">
                                    <MiniLoader />
                                </button>
                            ) : (
                                !loading && !isFiltering && hasMoreBlogs && (
                                    <button
                                        onClick={handleLoadMore}
                                        className="light_bg_color primary_text_color py-3 px-8 rounded-xl"
                                        disabled={isloadMore}
                                    >
                                        {t("loadMore")}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Only show if we have categories or tags */}
                    {(blogCategories.length > 0 || blogTags.length > 0) && (
                        <div className="col-span-12 lg:col-span-3">
                            <div className="relative">
                                <div className="sticky top-20 space-y-6">
                                    {/* Categories Card - Only show if we have categories */}
                                    {categoriesLoading ? (
                                        <div className="border rounded-xl shadow-sm p-4 space-y-4">
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    ) : blogCategories.length > 0 && (
                                        <BlogCategoriesCard
                                            categories={blogCategories}
                                            totalCount={totalBlogCount}
                                            onFilterChange={handleFilterChange}
                                        />
                                    )}
                                    
                                    {/* Tags Card - Only show if we have tags */}
                                    {tagsLoading ? (
                                        <div className="border rounded-xl shadow-sm p-4">
                                            <Skeleton className="h-6 w-3/4 mb-4" />
                                            <div className="flex flex-wrap gap-2">
                                                <Skeleton className="h-8 w-16 rounded-full" />
                                                <Skeleton className="h-8 w-20 rounded-full" />
                                                <Skeleton className="h-8 w-14 rounded-full" />
                                                <Skeleton className="h-8 w-24 rounded-full" />
                                                <Skeleton className="h-8 w-18 rounded-full" />
                                            </div>
                                        </div>
                                    ) : blogTags.length > 0 && (
                                        <BlogTagsCard
                                            tags={blogTags}
                                            onFilterChange={handleFilterChange}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    )
}

export default BlogsPage
