import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useParams, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MessageSquare, Bell, MessageCircle, Users, ArrowLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getGroupById } from "@/services/groupService";
import { toast } from "sonner";

export function GroupLayout() {
  const location = useLocation();
  const { groupId } = useParams();
  const currentPath = location.pathname;
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Fetch group details to get the actual name
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) return;
      
      try {
        setLoading(true);
        const response = await getGroupById(groupId);
        if (response.success && response.data) {
          setGroupName(response.data.name);
        } else {
          setGroupName(`Group ${groupId}`);
        }
      } catch (error) {
        console.error("Error fetching group details:", error);
        setGroupName(`Group ${groupId}`);
        toast.error("Failed to load group details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroupDetails();
  }, [groupId]);
  
  const tabs = [
    { 
      label: "News", 
      icon: MessageSquare, 
      path: `/dashboard/groups/${groupId}/news` 
    },
    {
      label: "Members",
      icon: Users,
      path: `/dashboard/groups/${groupId}/members`
    },
    { 
      label: "Chat", 
      icon: MessageCircle, 
      path: `/dashboard/groups/${groupId}/chat` 
    },
    { 
      label: "Announcements", 
      icon: Bell, 
      path: `/dashboard/groups/${groupId}/announcements` 
    }
  ];
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 text-gray-600 hover:text-gray-800"
            >
              <Link to="/dashboard/groups">
                <ArrowLeft className="h-4 w-4" />
                Back to Groups
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {loading ? "Loading..." : groupName}
              </h1>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-4">
        {/* Sub navigation tabs */}
        <Tabs defaultValue="news" className="mb-6">
          <TabsList className="w-full grid grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.path}
                value={tab.path.split('/').pop() || ''}
                className={cn(
                  "flex items-center gap-2",
                  currentPath === tab.path ? "bg-primary text-primary-foreground" : ""
                )}
                asChild
              >
                <Link to={tab.path}>
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {/* Content area */}
        <div className="bg-card rounded-lg p-4 shadow-sm min-h-[80vh]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default GroupLayout;