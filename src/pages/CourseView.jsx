import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, ChevronLeft, Play, BookOpen, Users, Calendar, Award, FileText, CircleDollarSign, Lock } from "lucide-react";
import { fetchCourseModules, fetchCourseById } from "@/services/courseService";
import { useCredits } from "@/contexts/CreditsContext";

const MODULE_UNLOCK_COST = 10;

export function CourseView() {
  const { courseId } = useParams();
  const location = useLocation();
  const hasAccess = location.state?.isAccessible ?? true;
  const { balance, spendCredits } = useCredits();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState(null);
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [error, setError] = useState("");
  const [totalDuration, setTotalDuration] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [unlockedModuleIds, setUnlockedModuleIds] = useState(() => {
    const stored = localStorage.getItem(`unlocked_modules_${courseId}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [confirm, setConfirm] = useState({ open: false, module: null, reason: '' });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        // Fetch both course details and modules in parallel
        const [courseData, modulesData] = await Promise.all([
          fetchCourseById(courseId),
          fetchCourseModules(courseId)
        ]);
        
        setCourseDetails(courseData);
        setModules(modulesData);
        setFilteredModules(modulesData);
        
        // Calculate total duration from modules
        const total = modulesData.reduce((sum, module) => {
          const duration = parseInt(module.estimated_duration) || 0;
          return sum + duration;
        }, 0);
        setTotalDuration(total);
      } catch (err) {
        setError("Failed to load course data");
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId) fetchData();
  }, [courseId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredModules(modules);
    } else {
      const filtered = modules.filter(module =>
        module.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredModules(filtered);
    }
  }, [searchQuery, modules]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container py-6 max-w-7xl">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading course modules...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container py-6 max-w-7xl">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <span className="text-4xl">❌</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Failed to load modules</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const formatDuration = (minutes) => {
    if (minutes === 0) return '0 min';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${minutes} min`;
    if (remainingMinutes === 0) return `${hours} hr`;
    return `${hours} hr ${remainingMinutes} min`;
  };

  const handleUnlockClick = (module) => {
    const moduleOrder = module.order || 0;
    const previousModule = modules.find(m => (m.order || 0) === moduleOrder - 1);
    const isUnlocked = unlockedModuleIds.includes(module.id);
    const isContentAvailable = module.resource_url;
    const isUpcoming = !isContentAvailable;
    const isLocked = !hasAccess && isContentAvailable;
    
    if (isUnlocked || !isLocked) return;
    
    // Check if modules are unlocked in order
    const canUnlockByOrder = !previousModule || unlockedModuleIds.includes(previousModule.id);
    
    if (!canUnlockByOrder) {
      setConfirm({ open: true, module, reason: 'order' });
      return;
    }
    
    if (balance < MODULE_UNLOCK_COST) {
      setConfirm({ open: true, module, reason: 'insufficient' });
      return;
    }
    
    setConfirm({ open: true, module, reason: 'confirm' });
  };

  const confirmUnlock = () => {
    if (!confirm.module) return;
    
    const newUnlockedIds = [...unlockedModuleIds, confirm.module.id];
    setUnlockedModuleIds(newUnlockedIds);
    localStorage.setItem(`unlocked_modules_${courseId}`, JSON.stringify(newUnlockedIds));
    
    // Deduct credits
    spendCredits(MODULE_UNLOCK_COST, {
      type: 'Module Unlock',
      moduleTitle: confirm.module.title,
      courseTitle: courseDetails?.title,
      courseId: courseId
    });
    
    setConfirm({ open: false, module: null, reason: '' });
  };

  const openCreditsModal = () => {
    window.dispatchEvent(new CustomEvent('open-credits-modal'));
    setConfirm({ open: false, module: null, reason: '' });
  };


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <main className="flex-1">
        <div className="container py-8 max-w-7xl">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/courses">
                <ChevronLeft size={16} />
                Back to courses
              </Link>
            </Button>
          </div>

          {/* Course Details Section */}
          {courseDetails && (
            <div className="mb-8">
              <Card className="overflow-hidden shadow-xl border-0">
                {/* Course Title and Description at the top */}
                <CardContent className="p-6">
                  <div className="max-w-4xl">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{courseDetails.title}</h1>
                    <p className={`text-gray-600 text-md leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-4' : ''}`}>
                      {courseDetails.description}
                    </p>
                    {courseDetails.description.length > 150 && (
                      <Button 
                        variant="link"
                        className="text-blue-600 hover:text-blue-800 p-0 h-auto mt-2 text-md font-medium hover:underline"
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      >
                        {isDescriptionExpanded ? 'Show Less' : 'Show More'}
                      </Button>
                    )}
                    
                    {/* Course Stats with reduced size and compact layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <div className="p-2 bg-green-500 rounded-lg shadow-md">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-green-700">Total Modules</p>
                          <p className="text-lg font-bold text-green-800">{modules.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                        <div className="p-2 bg-purple-500 rounded-lg shadow-md">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-purple-700">Duration</p>
                          <p className="text-lg font-bold text-purple-800">
                            {totalDuration > 0 ? formatDuration(totalDuration) : 'N/A'}
                          </p>
                        </div>
                      </div>
                      {courseDetails.instructor && (
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                          <div className="p-2 bg-orange-500 rounded-lg shadow-md">
                            <Award className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-orange-700">Instructor</p>
                            <p className="text-sm font-bold text-orange-800">{courseDetails.instructor}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Clock className="text-muted-foreground" size={20} />
              <span className="font-medium">Total Modules:</span>
              <span className="font-mono text-lg">{modules.length}</span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search modules..."
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredModules.length === 0 ? (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No modules found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery ? "Try adjusting your search query" : "This course doesn't have any modules yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map((module) => {
                const isUnlocked = unlockedModuleIds.includes(module.id);
                const isContentAvailable = module.resource_url;
                const isUpcoming = !isContentAvailable;
                const isLocked = !hasAccess && isContentAvailable;
                const previousModule = modules.find(m => (m.order || 0) === (module.order || 0) - 1);
                const canUnlockByOrder = !previousModule || unlockedModuleIds.includes(previousModule?.id);
                
                return (
                  <div key={module.id} className="module-card h-full">
                    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full ${(isLocked && !isUnlocked) ? 'opacity-75' : ''}`}>
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={module.thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"} 
                          alt={module.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Lock overlay for locked modules */}
                        {isLocked && !isUnlocked && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="bg-white/95 rounded-full p-4 shadow-xl">
                              <Lock className="w-8 h-8 text-gray-700" />
                            </div>
                          </div>
                        )}
                        {/* Clock overlay for upcoming modules */}
                        {isUpcoming && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="bg-white/95 rounded-full p-4 shadow-xl">
                              <Clock className="w-8 h-8 text-gray-700" />
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Fixed height for content area, flex-grow to fill space */}
                      <div className="flex flex-col flex-grow min-h-[170px] max-h-[170px] px-6 pt-4 pb-2">
                        <CardHeader className="pb-2 px-0 pt-0">
                          <CardTitle className="text-lg line-clamp-2 min-h-[56px]">{module.title}</CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">{module.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-3 px-0 pt-0 pb-0">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <BookOpen size={14} />
                              <span>Order: {module.order || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{module.estimated_duration || 0} min</span>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                      {/* Footer always at the bottom */}
                      <div className="mt-auto px-6 pb-4">
                        <CardFooter className="p-0 flex flex-col gap-2">
                          {hasAccess && (isUnlocked || !isLocked) && isContentAvailable ? (
                            <>
                              <Link to={`/dashboard/courses/${courseId}/modules/${module.id}/view`} className="w-full">
                                <Button className="w-full">
                                  <Play size={16} className="mr-2" />
                                  Start Module
                                </Button>
                              </Link>
                              <Link to={`/dashboard/courses/${courseId}/modules/${module.id}/assessments`} className="w-full">
                               <Button variant="outline" className="w-full">
                                  <FileText size={16} className="mr-2" />
                                  Start Assessment
                                </Button> 
                              </Link>
                            </>
                          ) : isUpcoming ? (
                            <Button className="w-full bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-colors duration-200" disabled>
                              <Clock size={16} className="mr-2" />
                              <span className="font-medium">Upcoming Module</span>
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleUnlockClick(module)}
                              className={`w-full transition-colors duration-200 ${canUnlockByOrder ? 'bg-purple-600 border-purple-600 text-white hover:bg-purple-700 hover:border-purple-700' : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-300'}`}
                            >
                              <Lock size={16} className="mr-2" />
                              <span className="font-medium">Unlock with {MODULE_UNLOCK_COST} credits</span>
                            </Button>
                          )}
                        </CardFooter>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {confirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md p-6">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {confirm.reason === 'order' && 'Unlock in Order'}
                {confirm.reason === 'insufficient' && 'Not Enough Credits'}
                {confirm.reason === 'confirm' && 'Confirm Unlock'}
              </h4>
              <p className="text-sm text-gray-700">
                {confirm.reason === 'order' && 'Please unlock modules in order. Unlock the previous module first.'}
                {confirm.reason === 'insufficient' && `You need ${MODULE_UNLOCK_COST} credits to unlock this module. You currently have ${balance} credits.`}
                {confirm.reason === 'confirm' && `Unlock "${confirm.module?.title}" for ${MODULE_UNLOCK_COST} credits?`}
              </p>
              {confirm.reason === 'confirm' && confirm.module && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium mb-1">Module Details:</div>
                    <div>• Duration: {confirm.module.estimated_duration || 0} minutes</div>
                    <div>• Order: {confirm.module.order || 'N/A'}</div>
                    <div className="mt-2">
                      <div className="font-medium">Current Credits: {balance}</div>
                      <div className="font-medium">Cost: {MODULE_UNLOCK_COST} credits</div>
                      <div className="font-medium">Remaining: {balance - MODULE_UNLOCK_COST} credits</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setConfirm({ open: false, module: null, reason: '' })}
              >
                Cancel
              </Button>
              {confirm.reason === 'insufficient' ? (
                <Button onClick={openCreditsModal} className="bg-blue-600 hover:bg-blue-700">
                  Buy Credits
                </Button>
              ) : confirm.reason === 'confirm' ? (
                <Button onClick={confirmUnlock} className="bg-purple-600 hover:bg-purple-700">
                  Confirm Unlock
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseView;