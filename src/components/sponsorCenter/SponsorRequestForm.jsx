import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const placements = [
  { value: "dashboard_banner", label: "Dashboard Banner", disabled: false },
  { value: "dashboard_sidebar", label: "Dashboard Sidebar", disabled: false },
  {
    value: "course_player_sidebar",
    label: "Course Player Sidebar",
    disabled: true,
  },
  {
    value: "course_listing_tile",
    label: "Course Listing Tile",
    disabled: true,
  },
  { value: "popup", label: "Popup Ad", disabled: true },
];

const SponsorRequestForm = ({
  formState,
  errors,
  onInputChange,
  onPlacementChange,
  onFileChange,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
      <Card className="rounded-xl shadow-sm border-gray-100">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">
            Sponsor Details
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Tell us about your company and ad campaign
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="sponsorName" className="text-sm font-medium">
                Sponsor Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sponsorName"
                name="sponsorName"
                placeholder="e.g. Nova FinServe"
                value={formState.sponsorName}
                onChange={onInputChange}
                className="mt-1.5"
                required
              />
              {errors.sponsorName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.sponsorName}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="companyName" className="text-sm font-medium">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="e.g. Nova FinServe Inc"
                value={formState.companyName}
                onChange={onInputChange}
                className="mt-1.5"
                required
              />
              {errors.companyName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.companyName}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="contactEmail" className="text-sm font-medium">
                Contact Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                placeholder="contact@company.com"
                value={formState.contactEmail}
                onChange={onInputChange}
                className="mt-1.5"
                required
              />
              {errors.contactEmail && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.contactEmail}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="contactPhone" className="text-sm font-medium">
                Contact Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                placeholder="+1234567890"
                value={formState.contactPhone}
                onChange={onInputChange}
                className="mt-1.5"
                required
              />
              {errors.contactPhone && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.contactPhone}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="adTitle" className="text-sm font-medium">
              Ad Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="adTitle"
              name="adTitle"
              placeholder="Enter ad headline"
              value={formState.adTitle}
              onChange={onInputChange}
              className="mt-1.5"
              required
            />
            {errors.adTitle && (
              <p className="text-xs text-red-500 mt-1">{errors.adTitle}</p>
            )}
          </div>
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Write a concise description..."
              value={formState.description}
              onChange={onInputChange}
              className="mt-1.5"
              required
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>
          <div>
            <Label htmlFor="website" className="text-sm font-medium">
              Website URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://example.com"
              value={formState.website}
              onChange={onInputChange}
              className="mt-1.5"
              required
            />
            {errors.website && (
              <p className="text-xs text-red-500 mt-1">{errors.website}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm border-gray-100">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">Media Upload</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Upload an image or video (max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-2">
            <Label htmlFor="media" className="text-sm font-medium">
              Upload Media <span className="text-red-500">*</span>
            </Label>
            <Input
              id="media"
              type="file"
              accept="image/*,video/*"
              onChange={onFileChange}
              className="mt-1.5"
            />
            <p className="text-xs text-gray-500">
              JPG, PNG, WEBP, MP4 formats supported
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm border-gray-100">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">
            Campaign Details
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Select placement and schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label className="text-sm font-medium">Preferred Placement</Label>
              <Select
                value={formState.placement}
                onValueChange={onPlacementChange}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select placement" />
                </SelectTrigger>
                <SelectContent>
                  {placements.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className={
                        option.disabled ? "opacity-50 cursor-not-allowed" : ""
                      }
                    >
                      {option.label}
                      {option.disabled && (
                        <span className="ml-2 text-xs text-gray-500">
                          (Coming soon)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="budget" className="text-sm font-medium">
                  Budget Estimate <span className="text-red-500">*</span>
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full w-5 h-5 bg-gray-100 hover:bg-gray-200 transition-colors"
                        aria-label="Budget information"
                      >
                        <Info className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        Sponsor Ads Are free for one month
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="budget"
                name="budget"
                type="number"
                value={formState.budget || "0"}
                disabled
                readOnly
                className="mt-1.5 bg-gray-50 cursor-not-allowed"
              />
              {errors.budget && (
                <p className="text-xs text-red-500 mt-1">{errors.budget}</p>
              )}
            </div>
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formState.startDate}
                onChange={onInputChange}
                className="mt-1.5"
                required
              />
              {errors.startDate && (
                <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
              )}
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formState.endDate}
                onChange={onInputChange}
                className="mt-1.5"
                required
              />
              {errors.endDate && (
                <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
              )}
              {errors.dateRange && (
                <p className="text-xs text-red-500 mt-1">{errors.dateRange}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2 sm:pt-4">
        <Button
          type="submit"
          className="bg-blue-600 px-6 sm:px-8 text-white hover:bg-blue-700 rounded-xl text-sm sm:text-base w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Loading..." : "Continue to Step 2"}
        </Button>
      </div>
    </form>
  );
};

export default SponsorRequestForm;
