import { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatInterface = ({ conversationId, initialMessages = [] }) => {
  const { messages, isConnected, isTyping, error, sendMessage } = useWebSocket(conversationId);
  const [allMessages, setAllMessages] = useState(initialMessages);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Merge WebSocket messages with initial messages
    if (messages.length > 0) {
      setAllMessages((prev) => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMessages = messages.filter(m => !existingIds.has(m.id));
        return [...prev, ...newMessages];
      });
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content) => {
    sendMessage(content);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Connection status */}
      {!isConnected && (
        <div className="px-6 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-700">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {error || 'Connecting to chat server...'}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <MessageList messages={allMessages} isTyping={isTyping} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <MessageInput 
          onSend={handleSendMessage} 
          disabled={!isConnected}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
