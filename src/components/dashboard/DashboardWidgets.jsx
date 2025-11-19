import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Folder, Users2, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAllCourses } from '@/services/courseService';
import { getGroups } from '@/services/groupService';

export default function DashboardWidgets() {
  const [catalogItems, setCatalogItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch catalog courses
        const courses = await fetchAllCourses();
        // Take first 4 courses for catalog overview
        const catalogData = (courses || []).slice(0, 4).map(course => ({
          id: course.id,
          title: course.title,
          thumbnail:
            course.thumbnail ||
            course.image ||
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000',
        }));
        setCatalogItems(catalogData);

        // Fetch groups
        const groupsResponse = await getGroups();
        if (groupsResponse.success && groupsResponse.data) {
          // Take first 3 groups
          const groupsData = (groupsResponse.data || [])
            .slice(0, 3)
            .map(group => ({
              id: group.id,
              name: group.name,
              description: group.description || '',
              thumbnail:
                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000', // Default thumbnail
            }));
          setGroups(groupsData);
        }
      } catch (error) {
        console.error('Error fetching widgets data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCatalogClick = () => {
    navigate('/dashboard/catalog');
  };

  const handleGroupClick = groupId => {
    navigate(`/dashboard/groups/${groupId}/news`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Widgets</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Catalog Overview Widget */}
        <Card className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Folder className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Catalog overview
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1.5 rounded-full">
                  {catalogItems.length}
                </span>
                <Link
                  to="/dashboard/catalog"
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-blue-600"
                  title="View all catalog"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="flex items-center gap-3 animate-pulse"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                      <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : catalogItems.length > 0 ? (
                catalogItems.map(item => (
                  <div
                    key={item.id}
                    onClick={handleCatalogClick}
                    className="flex items-center gap-3 hover:bg-blue-50 p-3 rounded-lg transition-all duration-200 cursor-pointer group/item border border-transparent hover:border-blue-100 hover:shadow-sm"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 group-hover/item:border-blue-200 transition-all duration-200"
                        onError={e => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000';
                        }}
                      />
                      <div className="absolute inset-0 rounded-full bg-blue-500/0 group-hover/item:bg-blue-500/10 transition-all duration-200"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-800 flex-1 group-hover/item:text-blue-700 transition-colors">
                      {item.title}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover/item:text-blue-600 opacity-0 group-hover/item:opacity-100 transition-all duration-200" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Folder className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    No catalog items available
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Groups Widget */}
        <Card className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <Users2 className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Groups</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1.5 rounded-full">
                  {groups.length}
                </span>
                <Link
                  to="/dashboard/groups"
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-purple-600"
                  title="View all groups"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : groups.length > 0 ? (
                groups.map(group => (
                  <div
                    key={group.id}
                    onClick={() => handleGroupClick(group.id)}
                    className="hover:bg-purple-50 p-3 rounded-lg transition-all duration-200 cursor-pointer group/item border border-transparent hover:border-purple-100 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={group.thumbnail}
                          alt={group.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 group-hover/item:border-purple-200 transition-all duration-200"
                          onError={e => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000';
                          }}
                        />
                        <div className="absolute inset-0 rounded-full bg-purple-500/0 group-hover/item:bg-purple-500/10 transition-all duration-200"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-800 mb-1 group-hover/item:text-purple-700 transition-colors line-clamp-1">
                          {group.name}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-1 group-hover/item:text-gray-700">
                          {group.description || 'Group description'}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover/item:text-purple-600 opacity-0 group-hover/item:opacity-100 transition-all duration-200 flex-shrink-0" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No groups available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #3b82f6);
          border-radius: 10px;
          transition: background 0.2s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7e22ce, #2563eb);
        }
      `}</style>
    </div>
  );
}
