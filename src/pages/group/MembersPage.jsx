import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Mail, Shield, UserPlus } from "lucide-react";
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
  
  // Count admins
  const adminCount = members.filter(member => member.isAdmin).length;

  // Check if current user is already a member
  const isCurrentUserMember = members.some(member => member.id === currentUserId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Group Members</CardTitle>
              <CardDescription>
                {members.length} members · {adminCount} admins
              </CardDescription>
            </div>
            {/* Join Group button - only show if user is not already a member */}
            {!isCurrentUserMember && (
              <Button 
                onClick={handleSelfJoin} 
                disabled={loading || addingMember} 
                className="bg-primary text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" /> 
                {addingMember ? "Joining..." : "Join Group"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2 pb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Loading members...
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} alt={`${member.name}'s avatar`} />
                          <AvatarFallback useSvgFallback={true}>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.isAdmin ? (
                        <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1 font-normal">
                          <Shield className="h-3 w-3" />
                          {member.role}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">{member.role}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {member.joinDate}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    {searchQuery ? "No members found matching your search" : "No members found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default MembersPage;