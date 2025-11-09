import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { UserIcon, CpuChipIcon } from '@heroicons/react/24/solid';

const MessageList = ({ messages, isTyping }) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <CpuChipIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Start a conversation with the AI
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}
      
      {isTyping && <TypingIndicator />}
    </div>
  );
};

const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start space-x-2 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}>
          {isUser ? (
            <UserIcon className="w-5 h-5 text-white" />
          ) : (
            <CpuChipIcon className="w-5 h-5 text-white" />
          )}
        </div>
        
        {/* Message content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={isUser ? 'message-user' : 'message-ai'}>
            <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
              {message.content}
            </ReactMarkdown>
          </div>
          
          {message.timestamp && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {format(new Date(message.timestamp), 'HH:mm')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const TypingIndicator = () => {
  return (
    <div className="flex items-start space-x-2">
      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
        <CpuChipIcon className="w-5 h-5 text-white" />
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default MessageList;
