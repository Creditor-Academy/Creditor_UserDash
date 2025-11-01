import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Settings, Shield, Star, MessageSquare } from 'lucide-react';
import { BaseFeature } from '../../FeatureComponents';

const ProTip = ({ children, emoji = "💡" }) => (
  <div className="relative bg-gradient-to-r from-amber-100 via-orange-50 to-yellow-100 rounded-2xl p-8 border border-amber-300/50 shadow-lg overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-y-16 translate-x-16"></div>
    
    <div className="relative z-10 flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
        <span className="text-xl">{emoji}</span>
      </div>
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-amber-800 font-bold text-lg">Pro Tip</span>
          <div className="px-2 py-1 bg-amber-200/50 rounded-full">
            <span className="text-amber-700 text-sm font-medium">Expert Advice</span>
          </div>
        </div>
        <p className="text-amber-900 leading-relaxed font-medium">{children}</p>
      </div>
    </div>
  </div>
);

const StepCard = ({ icon: Icon, title, items, color, index }) => (
  <div className={`
    relative bg-white rounded-2xl p-8 shadow-xl border-l-4 border-${color}-500 
    hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300
    group overflow-hidden
  `}>
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50 rounded-full -translate-y-16 translate-x-16`}></div>
    
    <div className="relative z-10 flex items-center gap-4 mb-6">
      <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
          <span className={`text-${color}-600 text-xs font-bold`}>{index + 1}</span>
        </div>
      </div>
      <h4 className={`text-xl font-bold text-${color}-800`}>{title}</h4>
    </div>
    
    <ul className="relative z-10 space-y-4">
      {items.map((item, itemIndex) => (
        <li key={itemIndex} className="flex items-start gap-4 group/item hover:transform hover:translate-x-1 transition-transform duration-200">
          <div className={`w-2 h-2 rounded-full bg-${color}-400 mt-2 flex-shrink-0`}></div>
          <span className="text-gray-700 leading-relaxed font-medium">{item}</span>
        </li>
      ))}
    </ul>
    
    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
  </div>
);

const IntroSection = () => (
  <div className="space-y-10">
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-10 rounded-3xl shadow-2xl"
    >
      <motion.div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
      
      <div className="relative z-10 flex items-center gap-6 mb-8">
        <motion.div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
            <Users className="w-10 h-10 text-white" />
          </div>
          <motion.div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <Star className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>
        <div>
          <h3 className="text-3xl font-bold text-white mb-2">
            Group Management
          </h3>
          <div className="flex items-center gap-2">
            <motion.div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-blue-100 text-sm font-medium">Instructor Tools</span>
          </div>
        </div>
      </div>
      
      <p className="relative z-10 text-blue-50 text-lg leading-relaxed max-w-3xl">
        Efficiently <span className="text-yellow-300 font-semibold">manage learning groups</span> and facilitate collaboration. 
        Access Group Management through the instructor portal sidebar to oversee both study and common groups, with comprehensive tools for group administration.
      </p>
    </motion.div>
  </div>
);

const GroupManagementGuide = () => {
  const featureData = {
    id: 'group_management',
    icon: Users,
    title: 'Group Management',
    introduction: <IntroSection />,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example1',
        title: 'Group Management Overview',
        description: 'Learn how to effectively manage learning groups and facilitate collaboration.'
      }
    ],
    steps: [
      {
        title: 'Step 1: Navigate to Group Management',
        renderDescription: () => (
          <div className="space-y-6 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={Users}
                title="Accessing the Feature"
                color="blue"
                index={0}
                items={[
                  'From the sidebar, navigate to the "Instructor Portal"',
                  'Click on it to open the "Instructor Dashboard"',
                  'From the "Instructor Tools" sidebar, click on "Group Management"',
                  'You will see a list of all "Open Groups" and "Course Related Groups"'
                ]}
              />
            </motion.div>

            <ProTip emoji="🎯">
              <span className="font-bold">Quick Tip:</span> The Group Management section provides centralized access 
              to all your learning groups where you can perform 6 main actions: View, Create, Edit, Add Member, View Member, and Delete Group.
            </ProTip>
          </div>
        )
      },
      {
        title: 'Step 2: Create a Group',
        renderDescription: () => (
          <div className="space-y-6 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-blue-50 border-l-4 border-blue-500 p-8 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-blue-800">Create Group Button</h4>
                </div>
                
                <p className="text-gray-700 mb-6 font-medium">
                  Click on <strong>"Create Group"</strong> button to create a new group:
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Click the <strong>"Create Group"</strong> button</p>
                      <p className="text-gray-600 text-sm mt-1">A form will open up for group creation</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 font-medium mb-3">Select the group type:</p>
                      <div className="space-y-2 ml-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          <span className="text-gray-700"><strong>Open Group:</strong> Accessible to all users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          <span className="text-gray-700"><strong>Course Related:</strong> Specific to a particular course</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 font-medium mb-3">Fill in the basic details:</p>
                      <div className="space-y-2 ml-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          <span className="text-gray-700"><strong>Group Name:</strong> Enter a descriptive name for your group</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          <span className="text-gray-700"><strong>Group Description:</strong> Add details about the group's purpose</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          <span className="text-gray-700"><strong>Display Picture (DP):</strong> Upload a group image</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Submit to create the group</p>
                      <p className="text-gray-600 text-sm mt-1">Your new group has been created successfully! 🎉</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <ProTip emoji="✨">
              <span className="font-bold">Getting Started:</span> Choose "Open Group" for general discussion groups 
              or "Course Related" if the group is tied to a specific course. Make sure to add a clear name and description 
              so members understand the group's purpose.
            </ProTip>
          </div>
        )
      },
      {
        title: 'Step 3: View Group Details',
        renderDescription: () => (
          <div className="space-y-6 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-8 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-emerald-800">View Action</h4>
                </div>
                
                <p className="text-gray-700 mb-4 font-medium">
                  Click on <strong>"View"</strong> to see comprehensive group details:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-600 font-bold text-lg">📝</span>
                      <span className="font-bold text-gray-800">Group Name</span>
                    </div>
                    <p className="text-gray-600 text-sm">The name of the group</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-600 font-bold text-lg">📄</span>
                      <span className="font-bold text-gray-800">Group Description</span>
                    </div>
                    <p className="text-gray-600 text-sm">Details about the group's purpose</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-600 font-bold text-lg">👥</span>
                      <span className="font-bold text-gray-800">No. of Members</span>
                    </div>
                    <p className="text-gray-600 text-sm">Total count of group members</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-600 font-bold text-lg">🖼️</span>
                      <span className="font-bold text-gray-800">Group DP</span>
                    </div>
                    <p className="text-gray-600 text-sm">Group display picture</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-600 font-bold text-lg">💬</span>
                      <span className="font-bold text-gray-800">No. of Posts</span>
                    </div>
                    <p className="text-gray-600 text-sm">Total number of posts in the group</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-600 font-bold text-lg">📅</span>
                      <span className="font-bold text-gray-800">Date of Creation</span>
                    </div>
                    <p className="text-gray-600 text-sm">When the group was created</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-600 font-bold text-lg">📌</span>
                      <span className="font-bold text-gray-800">Pinned Posts</span>
                    </div>
                    <p className="text-gray-600 text-sm">Important posts that are pinned</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-600 font-bold text-lg">📋</span>
                      <span className="font-bold text-gray-800">Group Posts</span>
                    </div>
                    <p className="text-gray-600 text-sm">All posts made in the group</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )
      },
      {
        title: 'Step 4: Create Posts and Announcements',
        renderDescription: () => (
          <div className="space-y-6 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-purple-50 border-l-4 border-purple-500 p-8 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-purple-800">Create Action</h4>
                </div>
                
                <p className="text-gray-700 mb-6 font-medium">
                  Click on <strong>"Create"</strong> to create posts and announcements in your group:
                </p>
                
                {/* Create Post Section */}
                <div className="bg-white rounded-xl p-6 border-2 border-purple-200 mb-6 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-bold text-purple-800 text-lg">Creating a Post</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">1</span>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Click on <strong>"Create Post"</strong> button</p>
                        <p className="text-gray-600 text-sm mt-1">A popup window will open up</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 font-medium mb-3">Fill in the required fields:</p>
                        <div className="space-y-2 ml-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                            <span className="text-gray-700"><strong>Type:</strong> Select the type of post</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                            <span className="text-gray-700"><strong>Title:</strong> Enter the post title</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                            <span className="text-gray-700"><strong>Content:</strong> Add your post content</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mt-1.5"></span>
                            <span className="text-gray-700"><strong>File Attachment:</strong> Attach files like images, videos, PDFs, or provide a manual link</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">3</span>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Click <strong>Submit</strong></p>
                        <p className="text-gray-600 text-sm mt-1">Your post has been created successfully! ✅</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Create Announcement Section */}
                <div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-600" />
                    </div>
                    <h4 className="font-bold text-purple-800 text-lg">Creating an Announcement</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">1</span>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Click on <strong>"Create Announcement"</strong></p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 font-medium mb-3">Provide the required information:</p>
                        <div className="space-y-2 ml-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                            <span className="text-gray-700"><strong>Title:</strong> Enter the announcement title</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                            <span className="text-gray-700"><strong>Content:</strong> Add the announcement content</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                            <span className="text-gray-700"><strong>Media:</strong> Attach any media files if needed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">3</span>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Submit to create the announcement</p>
                        <p className="text-gray-600 text-sm mt-1">The announcement will be posted! 📢</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <ProTip emoji="💡">
              <span className="font-bold">Content Tip:</span> Use posts for regular updates and discussions, 
              while announcements are perfect for important notifications that need immediate attention from all group members.
            </ProTip>
          </div>
        )
      },
      {
        title: 'Step 5: Edit Group Information',
        renderDescription: () => (
          <div className="space-y-6 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={Settings}
                title="Edit Action"
                color="indigo"
                index={3}
                items={[
                  'Click on "Edit" to modify group settings',
                  'Group Title - Update the group name',
                  'Group Description - Modify the group description',
                  'Group Type - Change between "Open Group" or "Course Related"',
                  'Privacy Settings - Make the group private if needed'
                ]}
              />
            </motion.div>

            <div className="bg-indigo-100 border border-indigo-300 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-indigo-900 font-medium">
                    <strong>Privacy Control:</strong> Making a group private restricts access to invited members only, 
                    perfect for course-specific discussions or selective study groups.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        title: 'Step 6: Add Members to Group',
        renderDescription: () => (
          <div className="space-y-6 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-amber-50 border-l-4 border-amber-500 p-8 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-amber-800">Add Member Action</h4>
                </div>
                
                <p className="text-gray-700 mb-6 font-medium">
                  Click on <strong>"Add Member"</strong> to invite new members to your group:
                </p>
                
                <ul className="space-y-4">
                  <li className="flex items-start gap-4 bg-white p-4 rounded-lg border border-amber-200">
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Select users you want to add to the group</p>
                      <p className="text-gray-600 text-sm mt-1">Browse available users or search by name</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-4 bg-white p-4 rounded-lg border border-amber-200">
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Send invitations to new members</p>
                      <p className="text-gray-600 text-sm mt-1">Members will receive a notification to join</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-4 bg-white p-4 rounded-lg border border-amber-200">
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Manage member permissions and roles</p>
                      <p className="text-gray-600 text-sm mt-1">Set appropriate access levels for new members</p>
                    </div>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        )
      },
      {
        title: 'Step 7: View Group Members',
        renderDescription: () => (
          <div className="space-y-6 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={Users}
                title="View Member Action"
                color="teal"
                index={5}
                items={[
                  'Click on "View Member" to see all group members',
                  'View the complete list of all members added to your group',
                  'See member details and participation status',
                  'Monitor member activity and engagement',
                  'Check when members joined the group'
                ]}
              />
            </motion.div>

            <ProTip emoji="👥">
              <span className="font-bold">Member Insights:</span> Regularly reviewing member activity helps you 
              identify engaged participants and those who might need additional support or encouragement.
            </ProTip>
          </div>
        )
      },
      {
        title: 'Step 8: Delete a Group',
        renderDescription: () => (
          <div className="space-y-6 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-red-800">Delete Group Action</h4>
                </div>
                
                <p className="text-gray-700 mb-6 font-medium">
                  Click on <strong>"Delete Group"</strong> when you need to remove a group:
                </p>
                
                <div className="bg-white rounded-xl p-6 border-2 border-red-200 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-red-800 mb-2">Important Notice</h5>
                      <p className="text-gray-700 leading-relaxed">
                        If your group's purpose has been fulfilled and you no longer need it, you can delete the group. 
                        <strong className="text-red-700"> Make sure to inform members before deletion</strong> as this 
                        action is typically <strong className="text-red-700">irreversible</strong>.
                      </p>
                      
                      <div className="mt-4 pt-4 border-t border-red-200">
                        <p className="text-gray-700 font-medium mb-2">Before deleting:</p>
                        <ul className="space-y-1 text-gray-600 text-sm ml-4">
                          <li>• Notify all group members</li>
                          <li>• Archive important posts and materials</li>
                          <li>• Consider making the group inactive instead</li>
                          <li>• Confirm this is the intended action</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )
      }
    ]
  };

  return <BaseFeature feature={featureData} />;
};

export default GroupManagementGuide;
