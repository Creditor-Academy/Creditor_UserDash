import React, { useState } from 'react'
import AddUpcoingContent from './AddUpcoingContent';
import AddUpcomingEvents from './AddUpcomingEvents';

const UpcomingPage = () => {
  const [activeTab, setActiveTab] = useState('content');

  return (
    <div>
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'content'
                ? 'text-[#6164ec] border-b-2 border-[#6164ec]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming Content
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'events'
                ? 'text-[#6164ec] border-b-2 border-[#6164ec]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming Events Banner
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'content' && <AddUpcoingContent />}
        {activeTab === 'events' && <AddUpcomingEvents />}
      </div>
    </div>
  )
}

export default UpcomingPage;
