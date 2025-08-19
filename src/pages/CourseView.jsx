import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, ChevronLeft, Play, BookOpen, Users, Calendar, Award, FileText, Lock, ShieldCheck, CreditCard, Wallet, Banknote, ArrowRight, CheckCircle2 } from "lucide-react";
import { fetchCourseModules, fetchCourseById } from "@/services/courseService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function CourseView() {
  const { courseId } = useParams();
  const location = useLocation();
  const hasAccess = location.state?.isAccessible ?? true;
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState(null);
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [error, setError] = useState("");
  const [totalDuration, setTotalDuration] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [unlockedModules, setUnlockedModules] = useState([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    name: "",
    email: ""
  });
  const [paymentErrors, setPaymentErrors] = useState({});

  // Visual metadata for payment methods
  const paymentMethods = [
    { id: 'stripe', label: 'Stripe', description: 'Cards, wallets', gradient: 'from-indigo-500 to-purple-600', Icon: CreditCard },
    { id: 'westcoast', label: 'Westcoast', description: 'ACH & bank transfer', gradient: 'from-emerald-500 to-teal-600', Icon: Banknote },
    { id: 'paypal', label: 'PayPal', description: 'PayPal balance, bank', gradient: 'from-yellow-400 to-amber-500', Icon: Wallet },
  ];

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

  // Load unlocked modules from localStorage after modules are loaded
  useEffect(() => {
    if (!courseId || modules.length === 0) return;
    const userId = localStorage.getItem('userId') || 'guest';
    const key = `unlocks:${userId}:${courseId}`;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      // keep only ids that still exist in current modules
      const validIds = new Set(modules.map(m => String(m.id)));
      const filtered = Array.isArray(saved) ? saved.filter(id => validIds.has(String(id))) : [];
      setUnlockedModules(filtered);
    } catch {
      setUnlockedModules([]);
    }
  }, [courseId, modules]);

  const sortedModules = useMemo(() => {
    if (!modules || modules.length === 0) return [];
    const copy = [...modules];
    copy.sort((a, b) => {
      const ao = a.order ?? Number.MAX_SAFE_INTEGER;
      const bo = b.order ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      // fallback stable sort by id string
      return String(a.id).localeCompare(String(b.id));
    });
    return copy;
  }, [modules]);

  const nextUnlockableModuleId = useMemo(() => {
    // Find the first module in sorted order that is not unlocked
    for (let i = 0; i < sortedModules.length; i++) {
      const m = sortedModules[i];
      if (!unlockedModules.includes(String(m.id))) {
        return String(m.id);
      }
    }
    return null;
  }, [sortedModules, unlockedModules]);

  const saveUnlocks = (updated) => {
    const userId = localStorage.getItem('userId') || 'guest';
    const key = `unlocks:${userId}:${courseId}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const getModulePrice = (module, index) => {
    // Prefer explicit price if present; else derive a stable demo price
    if (module && module.price) return Number(module.price);
    const base = 9.99;
    const delta = (index % 3) * 5; // 0, 5, 10
    return base + delta;
  };

  const handleUnlock = async (module) => {
    const idStr = String(module.id);
    if (nextUnlockableModuleId !== idStr) {
      toast.warning('Please unlock previous lessons first');
      return;
    }
    if (isProcessingPayment) return;
    setSelectedModule(module);
    setIsPaymentOpen(true);
  };

  const validatePayment = () => {
    const errors = {};
    if (!paymentForm.name.trim()) errors.name = 'Name is required';
    if (!paymentForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Valid email required';
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentSubmit = async (e) => {
    e?.preventDefault?.();
    if (!selectedModule) return;
    if (!validatePayment()) return;
    // Move to checkout modal instead of unlocking immediately
    setIsPaymentOpen(false);
    setIsCheckoutOpen(true);
  };

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
                const isUnlocked = hasAccess || unlockedModules.includes(String(module.id));
                const sortedIndex = sortedModules.findIndex(m => String(m.id) === String(module.id));
                const price = getModulePrice(module, sortedIndex);
                const isNextUnlockable = nextUnlockableModuleId === String(module.id);
                return (
                  <div key={module.id} className="module-card h-full">
                    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full ${(!isUnlocked) ? 'opacity-75' : ''}`}>
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={module.thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"} 
                          alt={module.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Lock overlay for locked modules (non-enrolled or no content) */}
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="bg-white/95 rounded-full p-4 shadow-xl">
                              <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
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
                          {/* Price/status row removed to avoid duplication with button label */}
                        </CardContent>
                      </div>
                      {/* Footer always at the bottom */}
                      <div className="mt-auto px-6 pb-4">
                        <CardFooter className="p-0 flex flex-col gap-2">
                          {isUnlocked && module.resource_url ? (
                            <>
                              <Link to={`/dashboard/courses/${courseId}/modules/${module.id}/view`} className="w-full">
                                <Button className="w-full">
                                  <Play size={16} className="mr-2" />
                                  Start Module
                                </Button>
                              </Link>
                              <Link to={`/dashboard/courses/${courseId}/modules/${module.id}/assessments`} className="w-full">
                                {/* <Button variant="outline" className="w-full">
                                  <FileText size={16} className="mr-2" />
                                  Start Assessment
                                </Button> */}
                              </Link>
                            </>
                          ) : (
                            <div className="w-full flex flex-col gap-2">
                              <Button 
                                className="w-full"
                                variant={isNextUnlockable ? "default" : "outline"}
                                disabled={!isNextUnlockable || isProcessingPayment}
                                onClick={() => handleUnlock(module)}
                              >
                                <>Unlock for ${price.toFixed(2)}</>
                              </Button>
                              {!isNextUnlockable && (
                                <span className="text-xs text-muted-foreground text-center">Unlock previous first</span>
                              )}
                              {!module.resource_url && (
                                <span className="text-[10px] text-muted-foreground text-center">Content coming soon — unlocking is for demo only</span>
                              )}
                            </div>
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
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[520px] relative" style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', margin: 0 }}>
          {/* Progress Stepper */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">1</div>
                <span className="text-sm font-medium text-gray-700">Details</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center font-medium">2</div>
                <span className="text-sm text-gray-500">Payment</span>
              </div>
            </div>
          </div>
          <DialogHeader>
            <DialogTitle>Unlock lesson</DialogTitle>
            <DialogDescription>
              {selectedModule ? (
                <span>
                  {selectedModule.title} — ${selectedModule ? getModulePrice(selectedModule, sortedModules.findIndex(m => String(m.id) === String(selectedModule.id))).toFixed(2) : ''}
                </span>
              ) : (
                <span>Complete your payment details</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={paymentForm.name} onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })} placeholder="John Doe" />
                {paymentErrors.name && <p className="text-xs text-red-600 mt-1">{paymentErrors.name}</p>}
              </div>
              <div>
                <Label htmlFor="email">User ID</Label>
                <Input id="email" type="email" value={paymentForm.email} onChange={(e) => setPaymentForm({ ...paymentForm, email: e.target.value })} placeholder="john@example.com" />
                {paymentErrors.email && <p className="text-xs text-red-600 mt-1">{paymentErrors.email}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)} disabled={isProcessingPayment}>Cancel</Button>
              <Button type="submit" disabled={isProcessingPayment}>
                {isProcessingPayment ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Processing
                  </span>
                ) : (
                  'Continue'
                )}
              </Button>
            </DialogFooter>
            <p className="text-[10px] text-muted-foreground text-center">Demo payment only. No real charges are made.</p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Checkout Modal - method selection + order summary */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[860px] relative" style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', margin: 0 }}>
          {/* Progress Stepper */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium text-gray-700">Details</span>
              </div>
              <div className="w-8 h-0.5 bg-blue-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">2</div>
                <span className="text-sm font-medium text-gray-700">Payment</span>
              </div>
            </div>
          </div>
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>Select a payment method and review your order</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Methods */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-600" /> Secure payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentMethods.map(({ id, label, description, gradient, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(id)}
                    className={`w-full text-left rounded-lg p-4 border transition group relative overflow-hidden ${selectedPaymentMethod === id ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`absolute inset-0 opacity-10 bg-gradient-to-r ${gradient}`}></div>
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-md flex items-center justify-center text-white bg-gradient-to-r ${gradient} shadow`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${selectedPaymentMethod === id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{selectedPaymentMethod === id ? 'Selected' : 'Select'}</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-md bg-gray-50 border border-gray-100">
                  <div className="h-12 w-16 rounded bg-white overflow-hidden flex items-center justify-center border">
                    <img src={selectedModule?.thumbnail || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400'} alt="thumb" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{selectedModule?.title || '—'}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{courseDetails?.title || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="font-semibold">${selectedModule ? getModulePrice(selectedModule, sortedModules.findIndex(m => String(m.id) === String(selectedModule.id))).toFixed(2) : '0.00'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Encrypted checkout</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Buyer protection</span>
                </div>
                <div className="border-t pt-3 flex items-center justify-between">
                  <span className="text-sm">Total</span>
                  <span className="text-xl font-bold">${selectedModule ? getModulePrice(selectedModule, sortedModules.findIndex(m => String(m.id) === String(selectedModule.id))).toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button className="flex-1" onClick={() => setIsCheckoutOpen(false)} variant="outline">Cancel</Button>
                  <Button className="flex-1" onClick={() => setIsGatewayOpen(true)}>
                    Continue <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">You will be redirected to {selectedPaymentMethod} to complete your purchase.</p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Simulated Payment Gateway Modal */}
      <Dialog open={isGatewayOpen} onOpenChange={setIsGatewayOpen}>
        <DialogContent className="sm:max-w-[520px] relative" style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', margin: 0 }}>
          {/* Progress Stepper */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium text-gray-700">Details</span>
              </div>
              <div className="w-8 h-0.5 bg-green-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium text-gray-700">Payment</span>
              </div>
              <div className="w-8 h-0.5 bg-blue-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">3</div>
                <span className="text-sm font-medium text-gray-700">Complete</span>
              </div>
            </div>
          </div>
          <DialogHeader>
            <DialogTitle>Pay with {selectedPaymentMethod?.charAt(0).toUpperCase() + selectedPaymentMethod?.slice(1)}</DialogTitle>
            <DialogDescription>Simulated gateway — choose an outcome to continue.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Charge</span>
              <span className="font-semibold">${selectedModule ? getModulePrice(selectedModule, sortedModules.findIndex(m => String(m.id) === String(selectedModule.id))).toFixed(2) : '0.00'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Lesson</span>
              <span className="text-sm font-medium">{selectedModule?.title || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Course</span>
              <span className="text-sm font-medium">{courseDetails?.title || '—'}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGatewayOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              // Simulate successful payment return
              setIsGatewayOpen(false);
              setIsCheckoutOpen(false);
              try {
                setIsProcessingPayment(true);
                await new Promise(res => setTimeout(res, 800));
                const idStr = String(selectedModule.id);
                const updated = Array.from(new Set([...
                  unlockedModules,
                  idStr
                ]));
                setUnlockedModules(updated);
                saveUnlocks(updated);
                toast.success('Payment successful via ' + selectedPaymentMethod + '. Lesson unlocked.');
                setPaymentForm({ name: '', email: '' });
                setPaymentErrors({});
                setSelectedModule(null);
              } catch (e) {
                toast.error('Payment failed. Please try again.');
              } finally {
                setIsProcessingPayment(false);
              }
            }}>Complete Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CourseView;