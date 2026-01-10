import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const placementLabels = {
  dashboard_banner: "Dashboard Banner",
  dashboard_sidebar: "Dashboard Sidebar",
  course_player_sidebar: "Course Player",
  course_listing_tile: "Course Listing Tile",
  popup: "Popup",
};

export const SponsorAdCard = ({
  ad,
  variant = "default",
  className,
  hideActions = false,
}) => {
  if (!ad) return null;
  const {
    title,
    description,
    sponsorName,
    ctaText,
    ctaUrl,
    placement,
    tier,
    logo,
  } = ad;
  return (
    <Card
      className={cn(
        "group border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 h-full flex flex-col overflow-hidden",
        variant === "tile" &&
          "bg-gradient-to-br from-white to-blue-50 border-blue-100",
        className,
      )}
    >
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {logo && (
              <img
                src={logo}
                alt={`${sponsorName} logo`}
                className="w-10 h-10 rounded-full object-cover border border-gray-100"
                loading="lazy"
              />
            )}
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500">
                {sponsorName}
              </p>
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] px-2 py-0 border-none bg-gray-100 text-gray-700",
                  tier === "Gold" && "bg-yellow-50 text-yellow-700",
                  tier === "Silver" && "bg-slate-100 text-slate-700",
                  tier === "Bronze" && "bg-amber-100 text-amber-700",
                )}
              >
                {tier} Tier
              </Badge>
            </div>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-100">
            {placementLabels[placement] || placement}
          </Badge>
        </div>

        <div className="space-y-2 flex-1">
          <h4 className="text-xl font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
        </div>

        {!hideActions && ctaText && ctaUrl && (
          <Button
            asChild
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
          >
            <a
              href={ctaUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2"
            >
              {ctaText}
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SponsorAdCard;
