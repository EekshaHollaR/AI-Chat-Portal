import axiosInstance from './axios-config';

export const conversationService = {
  // Get all conversations
  getAllConversations: async () => {
    const response = await axiosInstance.get('/conversations/');
    return response.data;
  },

  // Get single conversation with messages
  getConversation: async (id) => {
    const response = await axiosInstance.get(`/conversations/${id}/`);
    return response.data;
  },

  // Create new conversation
  createConversation: async (title = 'New Conversation') => {
    const response = await axiosInstance.post('/conversations/', { title });
    return response.data;
  },

  // End conversation (triggers summary generation)
  endConversation: async (id) => {
    const response = await axiosInstance.post(`/conversations/${id}/end_conversation/`);
    return response.data;
  },

  // Update conversation
  updateConversation: async (id, data) => {
    const response = await axiosInstance.patch(`/conversations/${id}/`, data);
    return response.data;
  },

  // Delete conversation
  deleteConversation: async (id) => {
    await axiosInstance.delete(`/conversations/${id}/`);
  },
};

export const messageService = {
  // Send message (for HTTP fallback)
  sendMessage: async (conversationId, content, sender = 'user') => {
    const response = await axiosInstance.post('/messages/', {
      conversation: conversationId,
      content,
      sender,
    });
    return response.data;
  },
};
