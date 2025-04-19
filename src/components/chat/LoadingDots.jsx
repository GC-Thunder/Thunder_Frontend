import React from 'react';

const LoadingDots = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
  </div>
);

export default LoadingDots;