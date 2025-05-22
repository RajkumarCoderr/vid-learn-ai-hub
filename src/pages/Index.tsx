
import React, { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    // Redirect to the popup UI
    window.location.href = '/index.html';
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">YouTube Learning Assistant</h1>
        <p className="text-xl text-gray-600">
          Enhancing YouTube with AI-powered learning tools.
        </p>
      </div>
    </div>
  );
};

export default Index;
