import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { contentBlockTypes } from '@/constants/LessonBuilder/blockTypes';

const ContentLibrary = ({ onBlockClick, sidebarCollapsed }) => {
  return (
    <div
      className="fixed top-16 h-[calc(100vh-4rem)] z-20 bg-white shadow-sm border-r border-gray-200 overflow-y-auto w-72 flex-shrink-0"
      style={{
        left: sidebarCollapsed ? "4.5rem" : "17rem"
      }}
    >
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            Content Library
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Drag and drop content blocks to build your lesson
          </p>
        </div>
       
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {contentBlockTypes.map((blockType) => (
              <Card
                key={blockType.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 h-28 flex flex-col group hover:border-indigo-200 hover:bg-indigo-50"
                onClick={() => onBlockClick(blockType)}
              >
                <CardContent className="flex flex-col items-center justify-center p-3 h-full">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2 group-hover:bg-indigo-200 transition-colors">
                    {blockType.icon}
                  </div>
                  <h3 className="text-xs font-medium text-gray-800 text-center">
                    {blockType.title}
                  </h3>
                  <p className="text-[10px] text-gray-500 text-center mt-1 line-clamp-1">
                    {blockType.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentLibrary;