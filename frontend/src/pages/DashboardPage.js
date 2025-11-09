import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { conversationService } from '../api/conversationService';
import ConversationCard from '../components/ConversationCard';
import { PlusIcon } from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'ended'

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await conversationService.getAllConversations();
      setConversations(data.results || data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      const newConv = await conversationService.createConversation();
      navigate(`/chat/${newConv.id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      try {
        await conversationService.deleteConversation(id);
        setConversations(conversations.filter(c => c.id !== id));
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'active') return conv.status === 'active';
    if (filter === 'ended') return conv.status === 'ended';
    return true;
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Conversations
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your AI conversations
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Conversation
          </button>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-6">
          {['all', 'active', 'ended'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                filter === filterOption
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>

        {/* Conversations Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No conversations found
            </p>
            <button onClick={handleCreateNew} className="btn-primary">
              Start Your First Conversation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                onDelete={() => handleDelete(conversation.id)}
                onClick={() => navigate(`/chat/${conversation.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
