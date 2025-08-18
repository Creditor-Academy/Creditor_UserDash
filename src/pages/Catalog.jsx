import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Loader2, FolderOpen, Star, Gem } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchAllCatalogs, fetchCatalogCourses, testCatalogAPI } from "@/services/catalogService";

export function CatalogPage() {
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [courseCounts, setCourseCounts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchCatalogsAndCounts = async () => {
      try {
        setLoading(true);
        const data = await fetchAllCatalogs();
        setCatalogs(data || []);
        const counts = {};
        await Promise.all(
          (data || []).map(async (catalog) => {
            const courses = await fetchCatalogCourses(catalog.id);
            counts[catalog.id] = courses.length;
          })
        );
        setCourseCounts(counts);
      } catch (err) {
        setError("Failed to load catalogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogsAndCounts();
    testCatalogAPI().then(result => {});
  }, []);

  const categories = Array.from(new Set((catalogs || []).map(catalog => catalog.category || "General")));

  const filteredCatalogs = (catalogs || []).filter(catalog => {
    const matchesSearch = catalog.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         catalog.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           (catalog.category || "General") === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const starterNames = ["Roadmap Series", "Start Your Passive Income Now"]; 
  const isStarter = (catalog) => starterNames.some(name => (catalog.name || "").trim().toLowerCase() === name.toLowerCase());
  const starterCatalogs = filteredCatalogs.filter(isStarter);
  // Create a stable order for Premium catalogs based on requested priority
  const idToIndex = new Map(filteredCatalogs.map((c, idx) => [c.id, idx]));
  const getPriority = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("become private") || n.includes("sov 101")) return 1; // Become Private + SOV 101
    if (n.includes("operate private")) return 2; // Operate Private
    if (n.includes("business credit") || n.includes("i want")) return 3; // Business credit + I want..
    if (n.includes("class recordings") || n.includes("class recording")) return 4; // Class Recordings
    return 999; // Others keep original order after prioritized ones
  };
  const premiumCatalogs = filteredCatalogs
    .filter(c => !isStarter(c))
    .slice()
    .sort((a, b) => {
      const pa = getPriority(a.name);
      const pb = getPriority(b.name);
      if (pa !== pb) return pa - pb;
      return (idToIndex.get(a.id) ?? 0) - (idToIndex.get(b.id) ?? 0);
    });

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container py-6 max-w-7xl">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="font-medium">Loading catalogs...</span>
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
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="bg-red-100 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="mt-2 bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="container py-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Catalogs</h1>
              <p className="text-gray-500 mt-1">Browse our collection of learning paths</p>
            </div>
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                placeholder="Search catalogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-80 py-2 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {(starterCatalogs.length + premiumCatalogs.length === 0) ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No catalogs found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="space-y-12">
              {starterCatalogs.length > 0 && (
                <div>
                  <div className="flex items-center mb-6">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    <h2 className="text-2xl font-semibold text-gray-900">Starter Catalogs</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {starterCatalogs.map((catalog) => (
                      <div key={catalog.id} className="group overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-200">
                        <div className="aspect-video w-full relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                          {catalog.thumbnail ? (
                            <img
                              src={catalog.thumbnail}
                              alt={catalog.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                          ) : null}
                          <div
                            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200"
                            style={{ display: catalog.thumbnail ? 'none' : 'flex' }}
                          >
                            <FolderOpen className="h-16 w-16 text-blue-600 opacity-80" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                        </div>

                        <div className="p-5 space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{catalog.name}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Starter
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2">{catalog.description}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4 text-blue-500" />
                              {courseCounts[catalog.id] || 0} courses
                            </span>
                          </div>

                          <Button 
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                            asChild
                          >
                            <Link 
                              to={`/dashboard/catalog/${catalog.id}`}
                              state={{ catalog: catalog }}
                              className="flex items-center justify-center"
                            >
                              Explore Catalog
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {premiumCatalogs.length > 0 && (
                <div>
                  <div className="flex items-center mb-6">
                    <Gem className="h-5 w-5 text-purple-500 mr-2" />
                    <h2 className="text-2xl font-semibold text-gray-900">Premium Catalogs</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {premiumCatalogs.map((catalog) => (
                      <div key={catalog.id} className="group overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-200">
                        <div className="aspect-video w-full relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-100">
                          {catalog.thumbnail ? (
                            <img
                              src={catalog.thumbnail}
                              alt={catalog.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                          ) : null}
                          <div
                            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-200"
                            style={{ display: catalog.thumbnail ? 'none' : 'flex' }}
                          >
                            <FolderOpen className="h-16 w-16 text-purple-600 opacity-80" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-indigo-500"></div>
                        </div>

                        <div className="p-5 space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{catalog.name}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Premium
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2">{catalog.description}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4 text-purple-500" />
                              {courseCounts[catalog.id] || 0} courses
                            </span>
                          </div>

                          <Button 
                            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
                            asChild
                          >
                            <Link 
                              to={`/dashboard/catalog/${catalog.id}`}
                              state={{ catalog: catalog }}
                              className="flex items-center justify-center"
                            >
                              Explore Catalog
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CatalogPage;