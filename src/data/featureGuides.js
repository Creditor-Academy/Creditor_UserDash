export const featureGuides = {
  private_group: {
    id: 'private_group',
    title: 'Private User Group',
    introduction: `Private User Groups in Athena LMS provide a secure and collaborative space where you can connect with fellow learners, share knowledge, and engage in meaningful discussions. These groups are designed to foster community learning while maintaining privacy and exclusivity.`,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example1',
        title: 'Creating a Private Group',
        description: 'Learn how to create your own private group and customize its settings.'
      },
      {
        url: 'https://www.youtube.com/embed/example2',
        title: 'Managing Group Activities',
        description: 'Discover how to manage discussions, share resources, and moderate group content.'
      }
    ],
    steps: [
      {
        title: 'Create or Join a Group',
        description: 'Click on the "Groups" section in the sidebar, then either create a new group or join an existing one using an invitation code.'
      },
      {
        title: 'Set Group Privacy',
        description: 'When creating a group, choose "Private" in the privacy settings and set member permissions.'
      },
      {
        title: 'Invite Members',
        description: 'Use the "Invite Members" button to generate invitation links or codes for specific users.'
      },
      {
        title: 'Start Discussions',
        description: 'Create new discussion topics, share resources, and engage with other members in the group feed.'
      }
    ]
  },
  private_chat: {
    id: 'private_chat',
    title: 'Private 1 on 1 Chat',
    introduction: `The Private 1 on 1 Chat feature enables direct, secure communication between users. Whether you need to discuss course materials, seek clarification, or collaborate on projects, this feature ensures your conversations remain private and organized.`,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example3',
        title: 'Starting Private Conversations',
        description: 'Learn how to initiate and manage private chat conversations.'
      },
      {
        url: 'https://www.youtube.com/embed/example4',
        title: 'Chat Features & Security',
        description: 'Explore chat features and understand the security measures in place.'
      }
    ],
    steps: [
      {
        title: 'Access Chat Feature',
        description: 'Click on the "Messages" icon in the sidebar to access your chat dashboard.'
      },
      {
        title: 'Start New Chat',
        description: 'Click the "New Message" button and select a user from the directory to start a private conversation.'
      },
      {
        title: 'Send Messages',
        description: 'Type your message in the chat box and use the additional features like file sharing or emojis as needed.'
      },
      {
        title: 'Manage Conversations',
        description: 'Use the conversation settings to mute notifications, search message history, or manage shared files.'
      }
    ]
  },
  my_courses: {
    id: 'my_courses',
    title: 'My Courses',
    introduction: `The My Courses section is your personal learning hub where you can access all your enrolled courses, track your progress, and continue your learning journey. It's designed to provide a seamless learning experience with easy access to all course materials and activities.`,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example5',
        title: 'Navigating Your Courses',
        description: 'Learn how to navigate through your enrolled courses and access course materials.'
      }
    ],
    steps: [
      {
        title: 'Access Your Courses',
        description: 'Click on "My Courses" in the sidebar to view all your enrolled courses.'
      },
      {
        title: 'Continue Learning',
        description: 'Click on any course card to resume where you left off or start a new module.'
      },
      {
        title: 'Track Progress',
        description: 'View your progress bars and completion status for each course.'
      }
    ]
  }
  // Add more features here...
};
