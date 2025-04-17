import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatSideBar from '../components/chatSideBar';
import ChatInput from '../components/ChatInput';
import ChatContainer from '../components/ChatContainer';
import { useToggleMenu } from '../Context/context';
import CommentaryPage from './commentaryPage';
import axios from 'axios';
import { set } from 'mongoose';

const API_URL = 'http://127.0.0.1:5000/api';
const LLM_STREAM_URL = 'http://localhost:5000/api/stream';

const Home = () => {
  const { chatId } = useParams(); // Get the chatId from URL
  const navigate = useNavigate();
  const { chats, setChats, loading } = useToggleMenu();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);
  const [streamText, setStreamText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [waitingForFirstChunk, setWaitingForFirstChunk] = useState(false);
  const [isCommentaryWindowOpen, setIsCommentaryWindowOpen] = useState(false);
  const [commentary, setCommentary] = useState('');

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
        // Find the chat that matches the chatId in URL
        const matchingChat = chats.find(chat => chat.id === chatId);
        if (matchingChat) {
          setCurrentChat(matchingChat);
        } else {
          // If chatId is invalid, navigate to the first chat
          navigate(`/chat/${chats[0].id}`);
        }
      } else if (chats.length > 0) {
        // If no chatId in URL, navigate to the first chat
        navigate(`/chat/${chats[0].id}`);
      }
    }
  }, [chats, chatId, navigate,isCommentaryWindowOpen]);

  const closeCommentaryWindow = () => {
    setIsCommentaryWindowOpen(false);
    setCommentary('');
  };


  const getLlmResponse = async (userInput, chatToUpdate) => {
    if (!chatToUpdate) {
      console.error("Cannot get LLM response: No chat to update");
      return;
    }
  
    try {
      // Reset stream states
      setStreamText('');
      setCommentary('');
      setIsStreaming(true);
      setWaitingForFirstChunk(true);
  
      // Always create a placeholder message in the chat
      // This is always needed for the database even if showing in commentary
      const tempAiMessage = {
        isUser: false,
        content: '',
        timestamp: new Date()
      };
  
      // Add placeholder to UI and state
      const updatedChatWithTempMessage = {
        ...chatToUpdate,
        messages: [...(chatToUpdate.messages || []), tempAiMessage]
      };
      
      setCurrentChat(updatedChatWithTempMessage);
      setChats(prev =>
        prev.map(c => (c.id === chatToUpdate.id ? updatedChatWithTempMessage : c))
      );
  
      // Kick off the stream POST
      const response = await fetch(`${LLM_STREAM_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery: userInput })
      });
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let isCommentaryMode = false; // Track if we switched to commentary mode
  
      // Process SSE-style stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value);
        const messages = chunk.split('\n\n');
        for (const msg of messages) {
          const lines = msg.split('\n');
          let eventName;
          let dataPayload;
  
          // Pull out event: and data:
          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventName = line.replace('event:', '').trim();
            } else if (line.startsWith('data:')) {
              try {
                dataPayload = JSON.parse(line.replace('data:', '').trim());
              } catch {
                // ignore parse errors
              }
            }
          }
  
          // --- Handle your custom openWindow event ---
          if (eventName === 'openWindow' && dataPayload) {
            console.log("Open window event received:");
            isCommentaryMode = true;
            setIsCommentaryWindowOpen(true);
            setCommentary(fullResponse); // Copy current progress to commentary
          }
  
          // --- Existing handlers ---
          if (dataPayload?.type === 'response.created') {
            console.log("Stream started:", dataPayload.response.id);
          }
          else if (dataPayload?.type === 'response.output_text.delta') {
            if (waitingForFirstChunk) {
              setWaitingForFirstChunk(false);
            }
            
            // Always update the full response for database consistency
            fullResponse += dataPayload.delta;
            
            // Update the appropriate display based on mode
            if (isCommentaryMode) {
              setCommentary(prev => prev + dataPayload.delta);
            } else {
              setStreamText(fullResponse);
              setCurrentChat(prev => {
                if (!prev || prev.id !== chatToUpdate.id) return prev;
                const msgs = [...prev.messages];
                msgs[msgs.length - 1] = {
                  ...msgs[msgs.length - 1],
                  content: fullResponse
                };
                return { ...prev, messages: msgs };
              });
              
              setChats(prev =>
                prev.map(c => {
                  if (c.id !== chatToUpdate.id) return c;
                  const msgs = [...c.messages];
                  msgs[msgs.length - 1] = {
                    ...msgs[msgs.length - 1],
                    content: fullResponse
                  };
                  return { ...c, messages: msgs };
                })
              );
            }
  
            // Always update the chat state for database consistency
            // This updates the actual message that will be saved later
            
          }
          else if (dataPayload?.type === 'response.completed') {
            console.log("Stream completed");
            setIsStreaming(false);
            setWaitingForFirstChunk(false);
  
            // Finalize message content (always do this for DB consistency)
            if(!isCommentaryMode){
              setCurrentChat(prev => {
                if (!prev || prev.id !== chatToUpdate.id) return prev;
                const msgs = [...prev.messages];
                msgs[msgs.length - 1] = {
                  ...msgs[msgs.length - 1],
                  content: fullResponse
                };
                return { ...prev, messages: msgs };
              });
              
              setChats(prev =>
                prev.map(c => {
                  if (c.id !== chatToUpdate.id) return c;
                  const msgs = [...c.messages];
                  msgs[msgs.length - 1] = {
                    ...msgs[msgs.length - 1],
                    content: fullResponse
                  };
                  return { ...c, messages: msgs };
                })
              );
            }
            
            // Persist final message to database
            const finalLlmMsg = {
              isUser: false,
              content: fullResponse,
              timestamp: new Date()
            };
            axios.post(`${API_URL}/chats/${chatToUpdate.id}/messages`, finalLlmMsg);
          }
          else if (dataPayload?.type === 'error') {
            console.error("Error:", dataPayload.error);
            setIsStreaming(false);
            setWaitingForFirstChunk(false);
          }
        }
      }
  
      return fullResponse;
    } catch (error) {
      console.error("Error in stream processing:", error);
      setIsStreaming(false);
      setWaitingForFirstChunk(false);
      return "Sorry, there was an error processing your request.";
    }
  };
  

  const handleSendMessage = async (userInput) => {
    if (!chats.length) {
      console.log('Making new chat with initial message:', userInput);
      await createNewChat(userInput);
      return;
    }

    if (!currentChat) {
      console.error("No current chat selected");
      return;
    }

    // Close commentary window if it's open when sending a new message
    if (isCommentaryWindowOpen) {
      setIsCommentaryWindowOpen(false);
      setCommentary('');
    }

    const userMessage = {
      isUser: true,
      content: userInput,
      timestamp: new Date()
    };

    // Create a copy of current chat to pass to getLlmResponse
    const chatToUpdate = { ...currentChat };

    // Update UI immediately with user message
    const updatedChat = {
      ...chatToUpdate,
      messages: [...(chatToUpdate.messages || []), userMessage]
    };
    
    setCurrentChat(updatedChat);

    // Update chats state to reflect the user message
    setChats(prevChats => {
      return prevChats.map(chat => 
        chat.id === chatToUpdate.id ? updatedChat : chat
      );
    });

    try {
      // Send message to API
      await axios.post(`${API_URL}/chats/${chatToUpdate.id}/messages`, userMessage);

      // Get LLM response using the updated chat reference
      await getLlmResponse(userInput, updatedChat);
      
    } catch (err) {
      console.error('Error in handling message', err);
    }
  };

  const createNewChat = async (initialMessage = null) => {
    try {
      console.log('Starting to create new chat...');
      const userId = "user123";

      // Close commentary window if it's open when creating a new chat
      if (isCommentaryWindowOpen) {
        setIsCommentaryWindowOpen(false);
        setCommentary('');
      }

      // Initial messages array
      const initialMessages = initialMessage ? [
        {
          isUser: true,
          content: initialMessage,
          timestamp: new Date()
        }
      ] : [];

      const newChat = {
        title: `New Chat ${chats.length + 1}`,
        userId: userId,
        messages: initialMessages
      };

      console.log('Sending new chat request to API:', newChat);
      
      // Create chat in database
      const response = await axios.post(`${API_URL}/chats`, newChat);
      
      if (response && response.data && response.data.success) {
        console.log('New chat created successfully with ID:', response.data.data.id);
        const createdChat = response.data.data;
        
        // Make sure the messages array exists
        if (!createdChat.messages) {
          createdChat.messages = [];
        }
        
        // If we have an initial message, add it to messages if not already there
        if (initialMessage && !createdChat.messages.some(msg => msg.content === initialMessage && msg.isUser === true)) {
          const userMsg = {
            isUser: true,
            content: initialMessage,
            timestamp: new Date()
          };
          createdChat.messages.push(userMsg);
          
          // Add message to backend if needed
          try {
            await axios.post(`${API_URL}/chats/${createdChat.id}/messages`, userMsg);
            console.log('Added initial user message to chat');
          } catch (msgError) {
            console.error('Error adding initial user message:', msgError);
          }
        }
        
        // Update chats state with new chat
        setChats(prevChats => [...prevChats, createdChat]);
        
        // Navigate to the new chat URL
        navigate(`/chat/${createdChat.id}`);
        
        // Set current chat
        setCurrentChat(createdChat);
        
        // Get LLM response for initial message
        if (initialMessage) {
          try {
            console.log('Getting LLM response for:', initialMessage);
            // Pass the created chat directly to getLlmResponse to ensure it's not null
            await getLlmResponse(initialMessage, createdChat);
          } catch (llmError) {
            console.error('Error getting or saving LLM response:', llmError);
          }
        }
      } else {
        console.error('API returned success: false. Response:', response.data);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      console.error("Error details:", error.response ? error.response.data : 'No response data');
    }
  };

 // LoadingDots component
 const LoadingDots = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
  </div>
);

if (loading) {
  return <div>Loading chats...</div>;
}

return (
  <>
    <div className="wrapper flex w-[100vw] justify-between h-screen overflow-hidden">
      <button
        className="md:hidden fixed top-4 left-4 z-[999] cursor-pointer "
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
            <ChatInput onSendMessage={handleSendMessage} isStreaming={isStreaming} />
          </div>
        </div>
      </div>
    </div>
    <CommentaryPage 
      isOpen={isCommentaryWindowOpen} 
      content={commentary} 
      onClose={closeCommentaryWindow}
    />
  </>
);
};

export default Home;