import React from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const SponsorCoursePlayerAd = ({ ad, className }) => {
  const navigate = useNavigate();

  if (!ad) return null;
  const {
    sponsorName,
    title,
    description,
    mediaUrl,
    mediaType,
    ctaText,
    ctaUrl,
    tier,
    id,
  } = ad;

  return (
    <Card
      className={cn(
        "border border-gray-200 rounded-2xl shadow-sm overflow-hidden sticky top-6",
        className,
      )}
    >
      {mediaType === "video" ? (
        <video
          src={mediaUrl}
          className="w-full h-48 object-cover"
          autoPlay
          muted
          loop
          controls
        />
      ) : (
        mediaUrl && (
          <img
            src={mediaUrl}
            alt={title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        )
      )}
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase">{sponsorName}</p>
            <Badge
              variant="outline"
              className="text-[11px] border-none bg-gray-100 text-gray-700"
            >
              {tier} Tier
            </Badge>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-100">
            Sponsored
          </Badge>
        </div>

        <div>
          <h4 className="text-xl font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {ctaText && id && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            onClick={async () => {
              try {
                const { trackSponsorAdClick } = await import(
                  "@/services/sponsorAdsService"
                );
                await trackSponsorAdClick(id);
              } catch (error) {
                console.warn("Failed to track sponsor ad click:", error);
              }
              navigate(`/dashboard/sponsor-ad/${id}`);
            }}
          >
            <Play className="w-4 h-4" />
            {ctaText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SponsorCoursePlayerAd;
