import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const placementCopy = {
  dashboard_banner: "Dashboard Banner",
  dashboard_sidebar: "Dashboard Sidebar",
  course_player_sidebar: "Course Player Sidebar",
  course_listing_tile: "Course Listing Tile",
  popup: "Popup Ad",
};

export const SponsorAdPreview = ({ ad, className }) => {
  if (!ad) return null;
  const {
    sponsorName,
    title,
    description,
    mediaUrl,
    mediaType,
    ctaText,
    ctaUrl,
    placement,
  } = ad;

  const placementLabel = placementCopy[placement] || "Ad Preview";

  return (
    <Card className={cn("border-blue-100 shadow-sm", className)}>
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-500">
              Live Preview
            </p>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {placementLabel}
            </h3>
          </div>
          {sponsorName && (
            <Badge className="bg-blue-50 text-blue-700 border-blue-200">
              {sponsorName}
            </Badge>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-inner overflow-hidden">
          {mediaType === "video" ? (
            <video
              className="w-full h-48 object-cover"
              src={mediaUrl}
              controls
              muted
              loop
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 relative overflow-hidden">
              {mediaUrl ? (
                <img
                  src={mediaUrl}
                  alt={title || "Sponsor ad media"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 text-sm">
                  <span>No media selected</span>
                </div>
              )}
            </div>
          )}

          <div className="p-5 space-y-2">
            <p className="text-sm font-medium text-blue-600">{sponsorName}</p>
            <h4 className="text-xl font-semibold text-gray-900">
              {title || "Sponsored Spotlight"}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {description || "Add copy to entice learners to click your CTA."}
            </p>

            {ctaText && ctaUrl && (
              <Button
                asChild
                className="mt-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg hover:shadow-xl transition"
              >
                <a href={ctaUrl} target="_blank" rel="noreferrer">
                  {ctaText}
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SponsorAdPreview;
