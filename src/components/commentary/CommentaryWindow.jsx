import React from 'react';

const CommentaryWindow = ({ isOpen, content, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bg-black bg-opacity-50 z-50 flex items-center justify-center h-[50vh] w-[50vw]" style={{
        top:'30%',
        right:'0%',
        transition: ' 0.3s ease all',
    }}>
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl h-5/6 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Commentary</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <div className="p-6 overflow-auto flex-grow">
          <div className="prose max-w-none">
            {content || 'No content yet.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentaryWindow;
