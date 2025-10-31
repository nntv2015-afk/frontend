import React, { useEffect, useState } from 'react'
import CustomImageTag from '../ReUseableComponents/CustomImageTag';
import { FiArrowRight } from 'react-icons/fi';
import { useTranslation } from '../Layout/TranslationContext';
import { formatDate } from '@/utils/Helper';

const BlogPostCard = ({ post }) => {
    const t = useTranslation();

    return (
        <div className="card_bg rounded-xl shadow-sm hover:shadow-md transition duration-300 border">
            {/* Blog Image */}
            <div className="relative h-52 w-full rounded-t-xl p-4 rounded-xl">
                <CustomImageTag
                    src={post?.image}
                    alt={post?.title}
                    className="w-full h-full rounded-xl"
                />
                <span className="absolute top-4 left-4 primary_bg_color text-white px-2 py-1 rounded-md text-sm">
                    {post?.category_name}
                </span>
            </div>

            {/* Blog Content */}
            <div className="p-4">
                {/* Date */}
                <p className="text-xs description_color mb-1">{formatDate(new Date(post?.created_at))}</p>

                {/* Title */}
                <h3 className="text-base font-semibold mb-2 line-clamp-2 min-h-10">
                    {post?.title}
                </h3>

                {/* Short Description */}
                <p className="text-sm description_color line-clamp-3 min-h-14 mb-3">
                    {post?.short_description}
                </p>

                {/* Read Now Link */}
                <a
                    href={`/blog-details/${post?.slug}`}
                    className="flex items-center primary_text_color font-medium text-sm transition-colors"
                >
                    {t("readNow")}
                    <FiArrowRight className="ml-1 w-4 h-4" />
                </a>
            </div>
        </div>
    );
};
export default BlogPostCard
