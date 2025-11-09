import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { conversationService } from '../api/conversationService';
import ChatInterface from '../components/ChatInterface';
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    } else {
      createNewConversation();
    }
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      const data = await conversationService.getConversation(conversationId);
      setConversation(data);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      setLoading(true);
      const data = await conversationService.createConversation();
      navigate(`/chat/${data.id}`, { replace: true });
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndConversation = async () => {
    if (!conversationId) return;
    
    try {
      await conversationService.endConversation(conversationId);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to end conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {conversation?.title || 'New Conversation'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={createNewConversation}
            className="btn-secondary"
          >
            <PlusIcon className="w-5 h-5 mr-2 inline" />
            New Chat
          </button>
          {conversationId && conversation?.status === 'active' && (
            <button
              onClick={handleEndConversation}
              className="btn-primary"
            >
              End Conversation
            </button>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      {conversationId && (
        <ChatInterface 
          conversationId={conversationId}
          initialMessages={conversation?.messages || []}
        />
      )}
    </div>
  );
};

export default ChatPage;
