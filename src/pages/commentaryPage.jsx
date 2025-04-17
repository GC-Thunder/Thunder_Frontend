import React from 'react';

const CommentaryPage = ({ isOpen, content, onClose }) => {
    return (
        <div className="wrapper bg-gray-950 h-[40vh] w-[70vw] fixed top-44 flex flex-col justify-center items-center rounded-lg shadow-lg border-2 border-gray-800" style={{
            right: isOpen ? '0%' : '-100%',
            transition: 'right 0.5s ease-in-out',
            zIndex: 1000,
        }}>
            {/* Close button */}
            <button 
                onClick={onClose}
                className="absolute top-2 right-2 text-white bg-red-600 hover:bg-red-700 rounded-full w-6 h-6 flex items-center justify-center"
            >
                ✕
            </button>
            
            <div className="content w-full h-full">
                <div className="commentaryContent w-full h-full">
                    <div className="flex-1 overflow-y-auto p-4 h-full">
                        <div className="mb-4 text-center h-full flex items-center justify-center">
                            <div className="inline-block p-3 rounded-lg max-w-[80%] text-white bg-gray-800 overflow-y-auto max-h-full">
                                {content || "Loading commentary..."}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentaryPage;