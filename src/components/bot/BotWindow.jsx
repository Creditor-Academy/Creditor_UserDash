import React from 'react';
import BotAvatar from './BotAvatar';

export default function BotWindow({ messages, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Dialogue Panel */}
      <div
        className="
          relative
          w-[600px]
          h-[200px]
          bg-white/60
          backdrop-blur-md
          rounded-2xl
          shadow-2xl
          p-4
          flex
          flex-row
        "
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {/* Left Side - Avatar */}
        <div className="w-1/3 flex items-center justify-center">
          <div onClick={onClose} className="cursor-pointer select-none">
            <BotAvatar />
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="w-2/3 flex flex-col pl-4">
          {/* Header */}
          <div className="mb-2 text-center">
            <div className="text-sm font-bold text-blue-500">
              ★★ Paulmichael ★★
            </div>
            <div className="text-xs text-gray-500">Intelligence Briefing</div>
          </div>

          {/* Messages */}
          <div className="text-gray-700 text-sm leading-relaxed overflow-y-auto flex-grow pr-2">
            {messages?.map((msg, i) => (
              <p key={i} className="mb-2">
                {msg.text}
              </p>
            ))}
          </div>

          {/* Input */}
          <div className="mt-2">
            <input
              type="text"
              placeholder="Type your response..."
              className="
                w-full
                border
                border-gray-300
                rounded-lg
                px-2
                py-1
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-blue-400
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
}
