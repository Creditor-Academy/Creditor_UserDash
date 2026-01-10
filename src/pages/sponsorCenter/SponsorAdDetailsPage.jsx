import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
  Globe,
  MapPin,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  Video,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchDashboardSponsorAds } from "@/services/sponsorAdsService";
import { getUserAdApplications } from "@/services/sponsorAdsService";

const SponsorAdDetailsPage = () => {
  const { adId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [adDetails, setAdDetails] = useState(null);

  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        setLoading(true);

        // Fetch all dashboard ads
        const ads = await fetchDashboardSponsorAds();

        // Find the ad with matching ID
        const ad = ads.find((a) => a.id === adId);

        if (!ad) {
          // If ad not found in dashboard ads, try to find it in user applications
          // This handles cases where the ad might be from a user's application
          try {
            const applications = await getUserAdApplications();
            const application = applications.find((app) => {
              // Check if the application has a sponsor_ad with matching ID
              return app.sponsor_ad?.id === adId || app.id === adId;
            });

            if (application && application.sponsor_ad) {
              // Use the sponsor_ad data
              const sponsorAd = application.sponsor_ad;

              // Extract website media from application
              const websiteImages = [];
              const websiteVideos = [];
              if (
                application.website_media &&
                Array.isArray(application.website_media)
              ) {
                application.website_media.forEach((media) => {
                  if (media.type === "image") {
                    websiteImages.push(media.url);
                  } else if (media.type === "video") {
                    websiteVideos.push(media.url);
                  }
                });
              }

              setAdDetails({
                id: sponsorAd.id,
                title: sponsorAd.title || application.title || "",
                description:
                  sponsorAd.description || application.description || "",
                detailedDescription:
                  application.offer_details || application.description || "",
                sponsorName:
                  sponsorAd.sponsor_name || application.sponsor_name || "",
                imageUrl: sponsorAd.image_url || application.image_url || "",
                videoUrl: sponsorAd.video_url || application.video_url || "",
                websiteUrl: sponsorAd.link_url || application.link_url || "",
                websiteDescription: application.website_description || "",
                websiteOverview: application.website_overview || "",
                websiteFeatures: application.website_features_highlights || "",
                websiteImages: websiteImages,
                websiteVideos: websiteVideos,
                startDate:
                  sponsorAd.start_date ||
                  application.preferred_start_date ||
                  "",
                endDate:
                  sponsorAd.end_date || application.preferred_end_date || "",
                placement: (() => {
                  const placementMap = {
                    DASHBOARD: "Dashboard Banner",
                    SIDEBAR: "Sidebar",
                    COURSE_PLAYER: "Course Player",
                    COURSE_LISTING: "Course Listing",
                    POPUP: "Popup",
                  };
                  const pos =
                    sponsorAd.position ||
                    application.preferred_position ||
                    "DASHBOARD";
                  return placementMap[pos] || pos;
                })(),
                status: (() => {
                  const statusMap = {
                    ACTIVE: "Active",
                    INACTIVE: "Inactive",
                    PAUSED: "Paused",
                    DELETED: "Deleted",
                  };
                  const stat = sponsorAd.status || "ACTIVE";
                  return statusMap[stat] || stat;
                })(),
                clickCount: Number(sponsorAd.click_count) || 0,
                viewCount: Number(sponsorAd.view_count) || 0,
              });
              setLoading(false);
              return;
            }
          } catch (appError) {
            console.warn("Failed to fetch from applications:", appError);
          }

          // Ad not found
          setAdDetails(null);
          toast.error("Ad not found");
          setLoading(false);
          return;
        }

        // Map backend ad data to frontend format
        // Also try to get additional details from user applications if available
        let additionalDetails = {};
        try {
          const applications = await getUserAdApplications();
          // Try multiple matching strategies
          const relatedApp = applications.find((app) => {
            // First try: match by sponsor_ad_id
            if (app.sponsor_ad_id === ad.id) return true;
            // Second try: match by nested sponsor_ad.id
            if (app.sponsor_ad?.id === ad.id) return true;
            // Third try: match by title and sponsor name (fuzzy match)
            if (
              app.title?.toLowerCase() === ad.title?.toLowerCase() &&
              app.sponsor_name?.toLowerCase() === ad.sponsor_name?.toLowerCase()
            ) {
              return true;
            }
            return false;
          });

          if (relatedApp) {
            console.log("✅ Found related application:", relatedApp);

            // Extract website media from application
            const websiteImages = [];
            const websiteVideos = [];
            if (
              relatedApp.website_media &&
              Array.isArray(relatedApp.website_media)
            ) {
              relatedApp.website_media.forEach((media) => {
                if (media.type === "image") {
                  websiteImages.push(media.url);
                } else if (media.type === "video") {
                  websiteVideos.push(media.url);
                }
              });
            }

            // Parse additional_notes if website details are stored there
            let parsedWebsiteOverview = relatedApp.website_overview || "";
            let parsedOfferDetails = relatedApp.offer_details || "";
            let parsedWebsiteFeatures =
              relatedApp.website_features_highlights || "";
            let parsedWebsiteDescription = relatedApp.website_description || "";

            // If fields are empty but additional_notes exists, try to parse it
            if (
              relatedApp.additional_notes &&
              (!parsedWebsiteOverview ||
                !parsedOfferDetails ||
                !parsedWebsiteFeatures)
            ) {
              const notes = relatedApp.additional_notes;
              console.log(
                "📝 Parsing additional_notes for website details:",
                notes.substring(0, 200),
              );

              // Try to extract website overview
              const overviewMatch = notes.match(
                /Website overview:\s*([\s\S]*?)(?=\n\n---|\n\nOffer details:|$)/i,
              );
              if (overviewMatch) {
                parsedWebsiteOverview = overviewMatch[1].trim();
                console.log(
                  "✅ Extracted website overview:",
                  parsedWebsiteOverview.substring(0, 100),
                );
              }

              // Try to extract offer details
              const offerMatch = notes.match(
                /Offer details:\s*([\s\S]*?)(?=\n\n---|\n\nWebsite features|$)/i,
              );
              if (offerMatch) {
                parsedOfferDetails = offerMatch[1].trim();
                console.log(
                  "✅ Extracted offer details:",
                  parsedOfferDetails.substring(0, 100),
                );
              }

              // Try to extract website features
              const featuresMatch = notes.match(
                /Website features[^:]*:\s*([\s\S]*?)(?=\n\n---|\n\nWebsite media|$)/i,
              );
              if (featuresMatch) {
                parsedWebsiteFeatures = featuresMatch[1].trim();
                console.log(
                  "✅ Extracted website features:",
                  parsedWebsiteFeatures.substring(0, 100),
                );
              }
            }

            additionalDetails = {
              websiteDescription: parsedWebsiteDescription,
              websiteOverview: parsedWebsiteOverview,
              websiteFeatures: parsedWebsiteFeatures,
              websiteImages: websiteImages,
              websiteVideos: websiteVideos,
              offerDetails: parsedOfferDetails,
            };

            console.log("📦 Final additionalDetails:", additionalDetails);
          } else {
            console.warn(
              "⚠️ No related application found for ad:",
              ad.id,
              ad.title,
            );
            console.log(
              "Available applications:",
              applications.map((app) => ({
                id: app.id,
                sponsor_ad_id: app.sponsor_ad_id,
                title: app.title,
                sponsor_name: app.sponsor_name,
              })),
            );
          }
        } catch (appError) {
          console.warn(
            "Could not fetch additional details from applications:",
            appError,
          );
        }

        // Map placement values
        const placementMap = {
          DASHBOARD: "Dashboard Banner",
          SIDEBAR: "Sidebar",
          COURSE_PLAYER: "Course Player",
          COURSE_LISTING: "Course Listing",
          POPUP: "Popup",
        };

        // Map status to display format
        const statusMap = {
          ACTIVE: "Active",
          INACTIVE: "Inactive",
          PAUSED: "Paused",
          DELETED: "Deleted",
        };

        setAdDetails({
          id: ad.id,
          title: ad.title || "",
          description: ad.description || "",
          detailedDescription:
            additionalDetails.offerDetails ||
            additionalDetails.websiteOverview ||
            ad.description ||
            "",
          sponsorName: ad.sponsor_name || "",
          imageUrl: ad.image_url || "",
          videoUrl: ad.video_url || "",
          websiteUrl: ad.link_url || "",
          websiteDescription: additionalDetails.websiteDescription || "",
          websiteOverview: additionalDetails.websiteOverview || "",
          websiteFeatures: additionalDetails.websiteFeatures || "",
          websiteImages: additionalDetails.websiteImages || [],
          websiteVideos: additionalDetails.websiteVideos || [],
          startDate: ad.start_date || "",
          endDate: ad.end_date || "",
          placement:
            placementMap[ad.position] || ad.position || "Dashboard Banner",
          status: statusMap[ad.status] || ad.status || "Active",
          clickCount: Number(ad.click_count) || 0,
          viewCount: Number(ad.view_count) || 0,
        });
      } catch (error) {
        console.error("Failed to fetch ad details:", error);
        toast.error(error.message || "Failed to load ad details");
        setAdDetails(null);
      } finally {
        setLoading(false);
      }
    };

    if (adId) {
      fetchAdDetails();
    }
  }, [adId]);

  const handleCopyLink = () => {
    if (adDetails?.websiteUrl) {
      navigator.clipboard.writeText(adDetails.websiteUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 p-4 sm:p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!adDetails) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <Card className="border-red-200 bg-red-50 shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-red-700 text-lg font-medium mb-4">
              Ad not found
            </p>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-2 hover:bg-white/80"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-2xl">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>

          <div className="relative p-8 sm:p-10 lg:p-12 text-white">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 mr-1.5" />
                {adDetails.status}
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <MapPin className="w-3 h-3 mr-1.5" />
                {adDetails.placement}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {adDetails.title}
            </h1>
            <p className="text-blue-100 text-lg sm:text-xl mb-6 max-w-2xl">
              {adDetails.description}
            </p>
            <div className="flex items-center gap-4 text-blue-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">
                  Sponsored by {adDetails.sponsorName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Media Preview */}
        {(adDetails.imageUrl || adDetails.videoUrl) && (
          <Card className="rounded-2xl border-0 shadow-xl overflow-hidden">
            <div className="w-full h-64 sm:h-96 lg:h-[500px] bg-gray-100 flex items-center justify-center relative group">
              {adDetails.videoUrl ? (
                <video
                  src={adDetails.videoUrl}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <img
                  src={adDetails.imageUrl}
                  alt={adDetails.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>
          </Card>
        )}

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Offer Details */}
          {adDetails.detailedDescription && (
            <Card className="rounded-2xl border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Offer Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {adDetails.detailedDescription}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Website Description */}
          {adDetails.websiteDescription && (
            <Card className="rounded-2xl border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Website Description</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {adDetails.websiteDescription}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Website Overview */}
          {adDetails.websiteOverview && (
            <Card className="rounded-2xl border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">
                    Complete Website Overview
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {adDetails.websiteOverview}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Website Features */}
          {adDetails.websiteFeatures && (
            <Card className="rounded-2xl border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">
                    Website Features & Highlights
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {adDetails.websiteFeatures}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Website Images */}
          {adDetails.websiteImages && adDetails.websiteImages.length > 0 && (
            <Card className="rounded-2xl border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-pink-600" />
                  </div>
                  <CardTitle className="text-xl">Website Images</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adDetails.websiteImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative group rounded-xl overflow-hidden"
                    >
                      <img
                        src={
                          typeof image === "string"
                            ? image
                            : URL.createObjectURL(image)
                        }
                        alt={`Website image ${index + 1}`}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x300?text=Image+Not+Available";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Website Videos */}
          {adDetails.websiteVideos && adDetails.websiteVideos.length > 0 && (
            <Card className="rounded-2xl border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <Video className="w-5 h-5 text-red-600" />
                  </div>
                  <CardTitle className="text-xl">Website Videos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {adDetails.websiteVideos.map((video, index) => (
                    <div
                      key={index}
                      className="relative rounded-xl overflow-hidden bg-gray-100"
                    >
                      <video
                        src={
                          typeof video === "string"
                            ? video
                            : URL.createObjectURL(video)
                        }
                        className="w-full h-auto"
                        controls
                        onError={(e) => {
                          console.error("Video load error:", e);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Website Link Section */}
        {adDetails.websiteUrl && (
          <Card className="rounded-2xl border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
            <CardHeader className="relative pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-xl text-white">
                  Visit Sponsor Website
                </CardTitle>
              </div>
              <CardDescription className="text-blue-100">
                Copy the link or click the button to explore
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <Globe className="w-5 h-5 text-white/80 flex-shrink-0" />
                  <input
                    type="text"
                    value={adDetails.websiteUrl}
                    readOnly
                    className="flex-1 bg-transparent border-none outline-none text-sm text-white font-mono placeholder-white/50"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyLink}
                    className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl flex items-center gap-2 flex-shrink-0 font-semibold px-6"
                  onClick={() => window.open(adDetails.websiteUrl, "_blank")}
                >
                  Visit Website
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-blue-100">
                Click the button above to open the sponsor's website in a new
                tab
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SponsorAdDetailsPage;
