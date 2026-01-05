import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Clock, Calendar, Lock } from "lucide-react";
import { getCourseTrialStatus } from "../../utils/trialUtils";
import TrialBadge from "../ui/TrialBadge";
import { useState, useContext } from "react";
import TrialExpiredDialog from "../ui/TrialExpiredDialog";
import { SeasonalThemeContext } from "@/contexts/SeasonalThemeContext";

function formatDuration(secs) {
  if (!secs) return "Duration not specified";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export function CourseCard({
  id,
  title,
  description,
  image,
  modulesCount,
  totalDurationSecs,
  category,
  isUpcoming = false,
  course, // Full course object for trial data
}) {
  const navigate = useNavigate();
  const [showTrialDialog, setShowTrialDialog] = useState(false);
  const { activeTheme } = useContext(SeasonalThemeContext);

  // Get trial status if course object is provided
  const trialStatus = course
    ? getCourseTrialStatus(course)
    : { isInTrial: false, isExpired: false, canAccess: true };

  const handleCourseClick = () => {
    if (trialStatus.isInTrial && trialStatus.isExpired) {
      setShowTrialDialog(true);
      return;
    }
    navigate(`/dashboard/courses/${id}`);
  };

  const handleCloseTrialDialog = () => {
    setShowTrialDialog(false);
  };

  const isNewYear = activeTheme === "newYear";

  const primaryButtonClasses = isNewYear
    ? "w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    : "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition-colors duration-200";

  const expiredButtonClasses = isNewYear
    ? "w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-semibold py-2 px-4 rounded shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5"
    : "w-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded shadow transition-colors duration-200 flex items-center justify-center gap-2";

  return (
    <div
      className={`dashboard-course-card ${activeTheme === "newYear" ? "newyear-course-card" : ""}`}
    >
      <div className="course-card-surface flex flex-col overflow-hidden rounded-lg border bg-card min-h-[400px] relative">
        <div
          className="w-full relative overflow-hidden bg-muted"
          style={{ height: "190px" }}
        >
          <img
            src={
              image ||
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"
            }
            alt={title}
            className="object-cover w-full h-full"
            style={{ height: "190px" }}
          />
          {activeTheme === "newYear" && (
            <span className="course-sparkle" aria-hidden="true">
              ✨
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0"></div>

          {/* Trial Badge Overlay */}
          {trialStatus.isInTrial && (
            <div className="absolute top-2 left-2">
              <TrialBadge timeRemaining={trialStatus.timeRemaining} />
            </div>
          )}

          {/* Lock Overlay for Expired Trials */}
          {trialStatus.isInTrial && trialStatus.isExpired && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <Lock className="w-6 h-6 mx-auto mb-1" />
                <p className="text-xs font-medium">Trial Expired</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 p-3 relative">
          <h3 className="font-semibold text-base line-clamp-1">{title}</h3>
          <p className="text-muted-foreground line-clamp-4 text-sm mt-1 mb-2">
            {description}
          </p>

          {!isUpcoming && (
            <div className="flex items-center text-xs text-muted-foreground gap-3 mt-auto">
              <div className="flex items-center gap-1">
                <BookOpen size={12} />
                <span>{modulesCount || 0} modules</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{formatDuration(totalDurationSecs)}</span>
              </div>
            </div>
          )}

          {isUpcoming ? (
            <div className="mt-auto pt-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  Stay tuned for more details
                </p>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 text-sm font-medium">
                  <Calendar size={14} />
                  Coming Soon
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {trialStatus.isInTrial && trialStatus.isExpired ? (
                <button
                  className={expiredButtonClasses}
                  onClick={handleCourseClick}
                >
                  <Lock size={14} />
                  Trial Expired - Enroll Now
                </button>
              ) : (
                <button
                  className={primaryButtonClasses}
                  onClick={handleCourseClick}
                >
                  {trialStatus.isInTrial ? "Continue Trial" : "View Course"}
                </button>
              )}

              {/* Trial Status Info */}
              {trialStatus.isInTrial && !trialStatus.isExpired && (
                <div className="text-xs text-center text-gray-600">
                  Trial ends:{" "}
                  {new Date(trialStatus.subscriptionEnd).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Trial Expired Dialog */}
      <TrialExpiredDialog
        isOpen={showTrialDialog}
        onClose={handleCloseTrialDialog}
        course={course}
      />
    </div>
  );
}

export default CourseCard;
