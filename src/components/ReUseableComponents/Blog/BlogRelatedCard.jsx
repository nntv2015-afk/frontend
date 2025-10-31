import React from "react";
import CustomImageTag from "../CustomImageTag";
import { useTranslation } from "@/components/Layout/TranslationContext";

const BlogRelatedCard = ({ recentPosts }) => {
  const t = useTranslation();
  return (
    <div className="border rounded-xl shadow-sm">
      {/* Header */}
      <h3 className="text-lg font-bold border-b px-4 py-3">
       {t("relatedBlog")}
      </h3>

      {/* Blog list */}
      <div className="space-y-4 p-4">
        {recentPosts?.map((post, index) => (
          <a
            key={index}
            href={`/blog-details/${post?.slug}`}
            className="flex items-start gap-3 rounded-lg p-2 transition"
          >
            {/* Thumbnail */}
            <CustomImageTag
              src={post?.image}
              alt={post?.title}
              className="w-32 h-20 rounded-lg object-cover"
            />

            {/* Text Content */}
            <div className="flex-1">
              <h4 className="text-sm font-semibold line-clamp-1">
              {post?.title}
              </h4>
              <p className="text-xs line-clamp-2 description_color" >
                {post?.short_description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default BlogRelatedCard;
