import React from 'react';
import { FaCreditCard, FaClock } from 'react-icons/fa';

const PaymentDashboard = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <FaCreditCard className="text-white text-4xl" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
              <FaClock className="text-yellow-900 text-lg" />
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Dashboard
        </h2>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold mb-4">
          <FaClock className="text-yellow-700" />
          Coming Soon
        </div>

        <p className="text-gray-600 text-lg leading-relaxed">
          We're working hard to bring you a comprehensive payment dashboard.
          This feature will be available soon!
        </p>
      </div>
    </div>
  );
};

export default PaymentDashboard;
