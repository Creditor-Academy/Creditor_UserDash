import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { professionalAvatars } from "@/lib/avatar-utils";
import { useParams } from "react-router-dom";
import { addGroupMember, getGroupMembers } from "@/services/groupService";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { isInstructorOrAdmin } from "@/services/userService";

// Sample members data with professional avatars (fallback before API load)
const initialMembers = [
  {
    id: 1,
    name: "Sarah Adams",
    email: "sarah.adams@example.com",
    avatar: professionalAvatars.female[0].url,
    joinDate: "Jan 15, 2025",
    isAdmin: true,
    role: "Group Admin"
  },
  {
    id: 2,
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: professionalAvatars.male[0].url,
    joinDate: "Jan 20, 2025",
    isAdmin: false,
    role: "Member"
  },
  {
    id: 3,
    name: "Mike Peterson",
    email: "mike.p@example.com",
    avatar: professionalAvatars.male[2].url,
    joinDate: "Feb 3, 2025",
    isAdmin: false,
    role: "Member"
  },
  {
    id: 4,
    name: "Lisa Wong",
    email: "lisa.wong@example.com",
    avatar: professionalAvatars.female[1].url,
    joinDate: "Feb 10, 2025",
    isAdmin: true,
    role: "Moderator"
  },
  {
    id: 5,
    name: "David Smith",
    email: "david.smith@example.com",
    avatar: professionalAvatars.male[1].url,
    joinDate: "Mar 5, 2025",
    isAdmin: false,
    role: "Member"
  }
];

export function MembersPage() {
  const { groupId } = useParams();
  const { userProfile } = useUser();
  const [members, setMembers] = useState(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteUserId, setInviteUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  // Removed make-admin selection state

  // Check if current user is admin or instructor
  const isAdminOrInstructor = isInstructorOrAdmin();
  const currentUserId = userProfile?.id;

  useEffect(() => {
    async function loadMembers() {
      if (!groupId) return;
      try {
        setLoading(true);
        console.log("📥 MembersPage: Fetching members for group:", groupId);
        const response = await getGroupMembers(groupId);
        console.log("✅ MembersPage: Members response:", response);
        
        // Handle different response structures
        const membersData = response?.data || response || [];
        const mapped = membersData.map((member) => {
          const backendRoleRaw = (member.role || member.user?.role || member.user_role || '').toString();
          const backendRole = backendRoleRaw.toUpperCase();
          const isAdmin = member.is_admin === true || backendRole === 'ADMIN' || backendRole === 'OWNER';
          const displayRole = isAdmin
            ? 'Admin'
            : backendRole
              ? backendRole.charAt(0) + backendRole.slice(1).toLowerCase()
              : 'Member';
          return {
            id: member.user?.id || member.user_id || member.id,
            name: `${member.user?.first_name ?? member.first_name ?? ''} ${member.user?.last_name ?? member.last_name ?? ''}`.trim() || 'Member',
            email: member.user?.email || member.email || '—',
            avatar: member.user?.image || professionalAvatars.male[0].url,
            joinDate: member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '—',
            isAdmin,
            role: displayRole,
          };
        });
        setMembers(mapped);
      } catch (error) {
        console.error("❌ MembersPage: Error loading members:", error);
        toast({ 
          title: "Failed to load members", 
          description: error?.response?.data?.message || error.message, 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, [groupId]);

  const handleSelfJoin = async () => {
    if (!groupId) return;
    try {
      setAddingMember(true);
      console.log("📤 MembersPage: Self-joining group:", groupId);
      await addGroupMember(groupId); // no userId => self join
      toast({ title: "Joined group", description: "You have been added to the group." });
      
      // Refresh members list
      const response = await getGroupMembers(groupId);
      const membersData = response?.data || response || [];
      const mapped = membersData.map((member) => {
        const backendRoleRaw = (member.role || member.user?.role || member.user_role || '').toString();
        const backendRole = backendRoleRaw.toUpperCase();
        const isAdmin = member.is_admin === true || backendRole === 'ADMIN' || backendRole === 'OWNER';
        const displayRole = isAdmin
          ? 'Admin'
          : backendRole
            ? backendRole.charAt(0) + backendRole.slice(1).toLowerCase()
            : 'Member';
        return {
          id: member.user?.id || member.user_id || member.id,
          name: `${member.user?.first_name ?? member.first_name ?? ''} ${member.user?.last_name ?? member.last_name ?? ''}`.trim() || 'Member',
          email: member.user?.email || member.email || '—',
          avatar: member.user?.image || professionalAvatars.male[0].url,
          joinDate: member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '—',
          isAdmin,
          role: displayRole,
        };
      });
      setMembers(mapped);
    } catch (error) {
      console.error("❌ MembersPage: Error joining group:", error);
      toast({ 
        title: "Join failed", 
        description: error?.response?.data?.message || error.message, 
        variant: "destructive" 
      });
    } finally {
      setAddingMember(false);
    }
  };

  const handleInvite = async () => {
    if (!groupId || !inviteUserId.trim()) return;
    try {
      setAddingMember(true);
      console.log("📤 MembersPage: Adding member to group:", groupId, "User ID:", inviteUserId.trim());
      await addGroupMember(groupId, inviteUserId.trim());
      toast({ title: "Member added", description: `User ${inviteUserId.trim()} added to group.` });
      setInviteUserId("");
      
      // Refresh members list
      const response = await getGroupMembers(groupId);
      const membersData = response?.data || response || [];
      const mapped = membersData.map((member) => ({
        id: member.user?.id || member.user_id || member.id,
        name: `${member.user?.first_name ?? member.first_name ?? ''} ${member.user?.last_name ?? member.last_name ?? ''}`.trim() || 'Member',
        email: member.user?.email || member.email || '—',
        avatar: member.user?.image || professionalAvatars.male[0].url,
        joinDate: member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '—',
        isAdmin: !!member.is_admin,
        role: member.is_admin ? 'Admin' : 'Member',
      }));
      setMembers(mapped);
    } catch (error) {
      console.error("❌ MembersPage: Error adding member:", error);
      toast({ 
        title: "Add member failed", 
        description: error?.response?.data?.message || error.message, 
        variant: "destructive" 
      });
    } finally {
      setAddingMember(false);
    }
  };
  
  // Filter members based on search query
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Make-admin selection helpers removed

  // Count admins
  const adminCount = members.filter(member => member.isAdmin).length;

  // Check if current user is already a member
  const isCurrentUserMember = members.some(member => member.id === currentUserId);

  // Make-admin action removed

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Group Members</CardTitle>
              <CardDescription className="text-sm">
                {members.length} members · {adminCount} admins
              </CardDescription>
            </div>
            {/* Make Admin feature removed */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center gap-2 pb-4">
            <Search className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <div className="flex-1 relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 sm:hidden" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 sm:pl-3"
              />
            </div>
          </div>

          <div className="-mx-4 sm:mx-0 overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <Table className="min-w-[520px] sm:min-w-0">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Member</TableHead>
                    <TableHead className="text-xs sm:text-sm">Role</TableHead>
                    <TableHead className="text-xs sm:text-sm">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    Loading members...
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <TableRow key={member.id} className={member.isAdmin ? "bg-blue-50/50" : undefined}>
                    {/* Selection checkbox removed */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className={member.isAdmin ? "ring-2 ring-blue-400" : undefined}>
                          <AvatarImage src={member.avatar} alt={`${member.name}'s avatar`} />
                          <AvatarFallback useSvgFallback={true}>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm sm:text-base">{member.name}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.isAdmin ? (
                        <Badge className="bg-primary/10 text-primary border-primary/20">Admin</Badge>
                      ) : (
                        <span className="text-xs sm:text-sm text-muted-foreground">{member.role}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm text-muted-foreground">
                      {member.joinDate}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    {searchQuery ? "No members found matching your search" : "No members found"}
                  </TableCell>
                </TableRow>
              )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MembersPage;