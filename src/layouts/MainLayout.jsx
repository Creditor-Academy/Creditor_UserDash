import React from 'react';
import { Outlet } from 'react-router-dom';
import LMSChatbot from '../components/LMSChatbot';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="relative">
        {children || <Outlet />}
      </main>
      
      {/* LMS Chatbot - Always visible */}
      <LMSChatbot />
    </div>
  );
};

export default MainLayout;
