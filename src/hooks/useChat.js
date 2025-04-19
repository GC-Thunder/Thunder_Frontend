import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatContext } from '../context/chatContext';
import { createChat, addMessage, streamLlmResponse } from '../api/apiService';
import { processStreamChunk } from '../utils/streamUtils';

export const useChat = (commentaryHook) => {
  const navigate = useNavigate();
  const { chats, setChats, currentChat, setCurrentChat } = useChatContext();
  const [streamText, setStreamText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [waitingForFirstChunk, setWaitingForFirstChunk] = useState(false);
  
  const { 
    openCommentaryWindow, 
    closeCommentaryWindow, 
    updateCommentary 
  } = commentaryHook;

  const handleSendMessage = async (userInput) => {
    if (!chats.length) {
      await createNewChat(userInput);
      return;
    }

    if (!currentChat) {
      console.error("No current chat selected");
      return;
    }

    // Close commentary window if open
    closeCommentaryWindow();

    const userMessage = {
      isUser: true,
      content: userInput,
      timestamp: new Date()
    };

    // Create a copy of current chat
    const chatToUpdate = { ...currentChat };

    // Update UI immediately with user message
    const updatedChat = {
      ...chatToUpdate,
      messages: [...(chatToUpdate.messages || []), userMessage]
    };
    
    setCurrentChat(updatedChat);
    setChats(prevChats => prevChats.map(chat => 
      chat.id === chatToUpdate.id ? updatedChat : chat
    ));

    try {
      // Send message to API
      await addMessage(chatToUpdate.id, userMessage);

      // Get LLM response
      await getLlmResponse(userInput, updatedChat);
    } catch (err) {
      console.error('Error handling message', err);
    }
  };

  const getLlmResponse = async (userInput, chatToUpdate) => {
    if (!chatToUpdate) {
      console.error("Cannot get LLM response: No chat to update");
      return;
    }
  
    try {
      // Reset stream states
      setStreamText('');
      setIsStreaming(true);
      setWaitingForFirstChunk(true);
  
      // Create placeholder message
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
  
      // Start streaming
      const reader = await streamLlmResponse(userInput);
      const decoder = new TextDecoder();
      let fullResponse = '';
      let isCommentaryMode = false;
  
      // Process stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value);
        const processedData = processStreamChunk(chunk, decoder);
        
        for (const { eventName, dataPayload } of processedData) {
          // Handle openWindow event
          if (eventName === 'openWindow') {
            isCommentaryMode = true;
            openCommentaryWindow(fullResponse);
          }
  
          // Handle other stream events
          if (dataPayload?.type === 'response.created') {
            console.log("Stream started:", dataPayload.response.id);
          }
          else if (dataPayload?.type === 'response.output_text.delta') {
            if (waitingForFirstChunk) {
              setWaitingForFirstChunk(false);
            }
            
            // Update full response
            fullResponse += dataPayload.delta;
            
            // Update UI based on mode
            if (isCommentaryMode) {
              updateCommentary(fullResponse);
            } else {
              setStreamText(fullResponse);
              updateChatMessages(chatToUpdate.id, fullResponse);
            }
          }
          else if (dataPayload?.type === 'response.completed') {
            setIsStreaming(false);
            setWaitingForFirstChunk(false);
  
            // Only persist to database if not in commentary mode
            if (!isCommentaryMode) {
              updateChatMessages(chatToUpdate.id, fullResponse);
              
              const finalLlmMsg = {
                isUser: false,
                content: fullResponse,
                timestamp: new Date()
              };
              
              await addMessage(chatToUpdate.id, finalLlmMsg);
            }
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

  const updateChatMessages = (chatId, content) => {
    setCurrentChat(prev => {
      if (!prev || prev.id !== chatId) return prev;
      const msgs = [...prev.messages];
      msgs[msgs.length - 1] = {
        ...msgs[msgs.length - 1],
        content
      };
      return { ...prev, messages: msgs };
    });
    
    setChats(prev =>
      prev.map(c => {
        if (c.id !== chatId) return c;
        const msgs = [...c.messages];
        msgs[msgs.length - 1] = {
          ...msgs[msgs.length - 1],
          content
        };
        return { ...c, messages: msgs };
      })
    );
  };

  const createNewChat = async (initialMessage = null) => {
    try {
      const userId = "user123"; // Replace with actual user ID

      // Close commentary window if open
      closeCommentaryWindow();

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
        userId,
        messages: initialMessages
      };
      
      // Create chat in database
      const createdChat = await createChat(newChat);
      
      if (createdChat) {
        // Make sure the messages array exists
        if (!createdChat.messages) {
          createdChat.messages = [];
        }
        
        // If we have an initial message, add it to messages if not already there
        if (initialMessage && !createdChat.messages.some(msg => 
          msg.content === initialMessage && msg.isUser === true
        )) {
          const userMsg = {
            isUser: true,
            content: initialMessage,
            timestamp: new Date()
          };
          createdChat.messages.push(userMsg);
          
          // Add message to backend
          try {
            await addMessage(createdChat.id, userMsg);
          } catch (msgError) {
            console.error('Error adding initial user message:', msgError);
          }
        }
        
        // Update chats state
        setChats(prevChats => [...prevChats, createdChat]);
        
        // Navigate to the new chat
        navigate(`/chat/${createdChat.id}`);
        
        // Set current chat
        setCurrentChat(createdChat);
        
        // Get LLM response for initial message
        if (initialMessage) {
          await getLlmResponse(initialMessage, createdChat);
        }
        
        return createdChat;
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  return {
    streamText,
    isStreaming,
    waitingForFirstChunk,
    handleSendMessage,
    createNewChat
  };
};
