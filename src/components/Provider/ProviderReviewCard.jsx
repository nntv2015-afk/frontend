"use client";
import React, { useState } from "react";
import Rating from "./Rating";
import CustomImageTag from "../ReUseableComponents/CustomImageTag";
import Lightbox from "../ReUseableComponents/CustomLightBox/LightBox";
import { useTranslation } from "../Layout/TranslationContext";

const ProviderReviewCard = ({ review }) => {
  const t = useTranslation();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const calculateDaysAgo = (date) => {
    if (!date) return "Unknown date"; // Handle missing date
    const ratedDate = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today - ratedDate); // Difference in milliseconds
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
    return `${diffDays} ${t("daysAgo")}`;
  };
  return (
    <div key={review?.id} className="border-b pb-8 p-4 last:border-0">
      {/* Profile and Review Header */}
      <div className="flex flex-col md:flex-row items-start gap-4">
        <CustomImageTag
          src={review?.profile_image}
          alt={review?.user_name}
          className="w-12 h-12 rounded-full mb-3 md:mb-0"
        />
        <div className="flex-1">
          <h3 className="font-medium text-xl">{review?.user_name}</h3>
          <p className="text-sm description_color mt-1">{review?.comment}</p>
          {/* Review Images */}
          {review?.images?.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {review?.images.slice(0, 4).map((image, index) => (
                <div
                  className="photo cursor-pointer relative"
                  key={index}
                  onClick={() => openLightbox(index)}
                >
                  <CustomImageTag
                    src={image}
                    alt={`Review Image ${index + 1}`}
                    className="w-16 h-16 rounded-md"

                  />
                  {/* Additional Images Count */}
                  {index === 3 && review?.images?.length > 4 && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center">
                      <span className="text-sm font-medium text-white">
                        +{review?.images?.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Star Rating */}
        <div className="flex flex-col items-start lg:items-end gap-2">
          <Rating rating={review?.rating} />
          <span className="text-sm description_color">
            {calculateDaysAgo(review?.rated_on)}
          </span>
        </div>
      </div>
      {isLightboxOpen && (
        <Lightbox
          isLightboxOpen={isLightboxOpen}
          images={review?.images} // Pass all images to the Lightbox
          initialIndex={currentImageIndex} // Start at the clicked image
          onClose={closeLightbox} // Close handler
        />
      )}
    </div>
  );
};

export default ProviderReviewCard;
