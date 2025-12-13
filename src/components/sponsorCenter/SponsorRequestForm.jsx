import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CalendarRange, ImagePlus, PenSquare } from 'lucide-react';

const placements = [
  { value: 'dashboard_banner', label: 'Dashboard Banner' },
  { value: 'sidebar_ad', label: 'Sidebar Ad' },
  { value: 'course_player', label: 'Course Player' },
  { value: 'course_listing_page', label: 'Course Listing Page' },
  { value: 'popup', label: 'Popup (optional)' },
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
    <form onSubmit={onSubmit} className="space-y-6">
      <Card className="rounded-3xl shadow-sm border-gray-100">
        <CardHeader className="flex items-center gap-3">
          <PenSquare className="w-5 h-5 text-blue-600" />
          <div>
            <CardTitle>Sponsor details</CardTitle>
            <CardDescription>
              Tell us who you are and what you’d like promote.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sponsorName">Sponsor Name</Label>
            <Input
              id="sponsorName"
              name="sponsorName"
              placeholder="e.g. Nova FinServe"
              value={formState.sponsorName}
              onChange={onInputChange}
            />
            {errors.sponsorName && (
              <p className="text-xs text-red-500 mt-1">{errors.sponsorName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="adTitle">Ad Title</Label>
            <Input
              id="adTitle"
              name="adTitle"
              placeholder="Hero headline"
              value={formState.adTitle}
              onChange={onInputChange}
            />
            {errors.adTitle && (
              <p className="text-xs text-red-500 mt-1">{errors.adTitle}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Write a concise summary learners will see."
              value={formState.description}
              onChange={onInputChange}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="website">URL / Website Link</Label>
            <Input
              id="website"
              name="website"
              placeholder="https://example.com"
              value={formState.website}
              onChange={onInputChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm border-gray-100">
        <CardHeader className="flex items-center gap-3">
          <ImagePlus className="w-5 h-5 text-blue-600" />
          <div>
            <CardTitle>Media upload</CardTitle>
            <CardDescription>
              Upload an image or short video (max 10MB).
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="media">Upload Media</Label>
          <Input
            id="media"
            type="file"
            accept="image/*,video/*"
            onChange={onFileChange}
          />
          <p className="text-xs text-gray-500">
            Accepted formats: JPG, PNG, WEBP, MP4
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm border-gray-100">
        <CardHeader className="flex items-center gap-3">
          <CalendarRange className="w-5 h-5 text-blue-600" />
          <div>
            <CardTitle>Placement options</CardTitle>
            <CardDescription>
              Select where and how long you’d like to run.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Preferred Placement</Label>
            <Select
              value={formState.placement}
              onValueChange={onPlacementChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select placement" />
              </SelectTrigger>
              <SelectContent>
                {placements.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="budget">Budget Estimate</Label>
            <Input
              id="budget"
              name="budget"
              type="number"
              placeholder="e.g. 5000"
              value={formState.budget}
              onChange={onInputChange}
            />
          </div>
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formState.startDate}
              onChange={onInputChange}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formState.endDate}
              onChange={onInputChange}
            />
            {errors.dateRange && (
              <p className="text-xs text-red-500 mt-1">{errors.dateRange}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm border-gray-100">
        <CardHeader>
          <CardTitle>Request summary</CardTitle>
          <CardDescription>
            Let us know any additional requirements or targeting notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Optional: unique requirements, timing or targeting notes."
            value={formState.notes}
            onChange={onInputChange}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="rounded-full bg-blue-600 px-8 text-white hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
};

export default SponsorRequestForm;
