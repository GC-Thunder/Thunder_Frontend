import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatSideBar from '../components/chat/ChatSideBar';
import ChatInput from '../components/chat/ChatInput';
import ChatContainer from '../components/chat/ChatContainer';
import CommentaryWindow from '../components/commentary/CommentaryWindow';
import LoadingDots from '../components/chat/LoadingDots';
import { useChatContext } from '../context/chatContext';
import { useChat } from '../hooks/useChat';
import { useCommentary } from '../hooks/useCommentary';

const Home = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { chats, setCurrentChat, currentChat, loading } = useChatContext();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);
  
  const commentaryHook = useCommentary();
  const { 
    isStreaming, 
    waitingForFirstChunk, 
    handleSendMessage, 
    createNewChat 
  } = useChat(commentaryHook);

  // Handle mobile sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 735) {
        setIsMobileSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set current chat based on URL param
  useEffect(() => {
    if (chats.length > 0) {
      if (chatId) {
        const matchingChat = chats.find(chat => chat.id === chatId);
        if (matchingChat) {
          setCurrentChat(matchingChat);
        } else {
          navigate(`/chat/${chats[0].id}`);
        }
      } else if (chats.length > 0) {
        navigate(`/chat/${chats[0].id}`);
      }
    }
  }, [chats, chatId, navigate, commentaryHook.isCommentaryWindowOpen]);

  if (loading) {
    return <div>Loading chats...</div>;
  }

  return (
    <>
      <div className="wrapper flex w-[100vw] justify-between h-screen overflow-hidden">
        <button
          className="md:hidden fixed top-4 left-4 z-[999] cursor-pointer"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        >
          {/* Hamburger icon */}
          <div className="w-6 h-0.5 bg-gray-800 mb-1"></div>
          <div className="w-6 h-0.5 bg-gray-800 mb-1"></div>
          <div className="w-6 h-0.5 bg-gray-800"></div>
        </button>
        
        <ChatSideBar 
          createNewChat={createNewChat} 
          isMobileSidebarOpen={isMobileSidebarOpen} 
        />
        
        <div className="h-screen flex flex-col bg-gradient-to-b from-white to-blue-200 md:w-[76vw] md:ml-[24vw] shadow-inner w-[100vw] overflow-x-hidden">
          <div className="flex flex-col h-full">
            <div className="overflow-hidden flex-1 flex flex-col">
              {currentChat ? (
                <ChatContainer 
                  messages={currentChat.messages || []} 
                  waitingForFirstChunk={waitingForFirstChunk}
                  loadingComponent={<LoadingDots />}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No chats yet. Start a new conversation!</p>
                </div>
              )}
            </div>

            <div className="p-4">
              <ChatInput 
                onSendMessage={handleSendMessage} 
                isStreaming={isStreaming} 
              />
            </div>
          </div>
        </div>
      </div>
      
      <CommentaryWindow 
        isOpen={commentaryHook.isCommentaryWindowOpen} 
        content={commentaryHook.commentary} 
        onClose={commentaryHook.closeCommentaryWindow}
      />
    </>
  );
};

export default Home;