import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';
const LLM_STREAM_URL = 'http://localhost:5000/api/stream';

export const fetchChats = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/chats?userId=${userId}`);
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
};

export const createChat = async (newChat) => {
  try {
    const response = await axios.post(`${API_URL}/chats`, newChat);
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const addMessage = async (chatId, message) => {
  try {
    await axios.post(`${API_URL}/chats/${chatId}/messages`, message);
    return true;
  } catch (error) {
    console.error('Error adding message:', error);
    return false;
  }
};

export const streamLlmResponse = async (userQuery) => {
  try {
    const response = await fetch(`${LLM_STREAM_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userQuery })
    });
    return response.body.getReader();
  } catch (error) {
    console.error('Error streaming LLM response:', error);
    throw error;
  }
};
