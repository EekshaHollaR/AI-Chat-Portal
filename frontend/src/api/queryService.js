import axiosInstance from './axios-config';

export const queryService = {
  // Query past conversations
  queryConversations: async (queryText, filters = {}) => {
    const response = await axiosInstance.post('/conversations/query_past/', {
      query: queryText,
      top_k: filters.topK || 5,
      date_from: filters.dateFrom || null,
      date_to: filters.dateTo || null,
    });
    return response.data;
  },
};
